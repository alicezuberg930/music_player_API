# Run Yukikaze on a physical Android device

This guide configures the current Arch Linux workstation to build, install, and debug the bare React Native app on a USB-connected Android phone. It uses only command-line tools: no Android Studio, emulator, virtual machine, system image, HAXM, or KVM setup is required.

## Required versions

These values come from the checked-in React Native 0.87.1 Android project and must stay aligned with `android/build.gradle`.

| Component               | Required value                      |
| ----------------------- | ----------------------------------- |
| Node.js                 | 22.11.0 or newer                    |
| Bun                     | Installed workspace package manager |
| JDK                     | 17                                  |
| Android SDK Platform    | API 37                              |
| Android SDK Build Tools | 37.0.0                              |
| Android NDK             | 27.1.12297006                       |
| CMake                   | 3.30.5                              |
| Minimum phone version   | Android 7.0 / API 24                |
| Application ID          | `com.yukikazeapp`                   |

## 1. Install Arch Linux packages

Install JDK 17, USB device rules, and the archive utility:

```sh
sudo pacman -Syu
sudo pacman -S --needed android-udev jdk17-openjdk unzip
sudo usermod -aG adbusers "$USER"
```

Log out of the desktop session and back in after adding the group. Confirm that `adbusers` appears in the output:

```sh
id
```

Do not install `android-tools` when following this guide. The SDK Platform-Tools installed below provide `adb`, avoiding two different `adb` versions on `PATH`.

## 2. Install the Android command-line tools

Download `commandlinetools-linux-15859902_latest.zip` from the official [Android command-line tools page](https://developer.android.com/studio#command-tools) after accepting its license. The expected SHA-256 digest is:

```text
4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583
```

Install the archive using the directory layout required by `sdkmanager`:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_TOOLS_ARCHIVE="$HOME/Downloads/commandlinetools-linux-15859902_latest.zip"
export ANDROID_TOOLS_TEMP="$(mktemp -d)"

echo "4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583  $ANDROID_TOOLS_ARCHIVE" | sha256sum --check
unzip -q "$ANDROID_TOOLS_ARCHIVE" -d "$ANDROID_TOOLS_TEMP"
mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
cp -a "$ANDROID_TOOLS_TEMP/cmdline-tools/." "$ANDROID_HOME/cmdline-tools/latest/"
```

Add the following configuration to `~/.bashrc`. Use `~/.zshrc` instead when running Zsh.

```sh
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Load the updated environment:

```sh
source ~/.bashrc
java -version
sdkmanager --version
```

`java -version` must report Java 17. React Native recommends JDK 17 and warns that higher versions can cause Android build problems.

## 3. Install this project's Android SDK packages

Install only the SDK packages required by this project:

```sh
sdkmanager --sdk_root="$ANDROID_HOME" --install \
  "platform-tools" \
  "platforms;android-37" \
  "build-tools;37.0.0" \
  "ndk;27.1.12297006" \
  "cmake;3.30.5"

sdkmanager --sdk_root="$ANDROID_HOME" --licenses
```

Review and accept the licenses interactively. Do not install any package whose name starts with `emulator` or `system-images`; neither is needed for a physical phone.

Verify the tools and environment:

```sh
adb version
sdkmanager --sdk_root="$ANDROID_HOME" --list
echo "$JAVA_HOME"
echo "$ANDROID_HOME"
```

## 4. Install JavaScript dependencies

From the repository root:

```sh
bun install
```

The app declares `@react-native/gradle-plugin` and `@react-native/codegen` directly because Bun's isolated workspace layout does not expose React Native's transitive copies at the paths Gradle expects.

## 5. Prepare the phone

1. Confirm the phone runs Android 7.0/API 24 or newer.
2. Open **Settings → About phone → Software information** and tap **Build number** seven times.
3. Open **Settings → Developer options** and enable **USB debugging**.
4. Connect the phone with a data-capable USB cable, not a charge-only cable.
5. Unlock the phone and select **File transfer / Android Auto** when Android asks for the USB mode.
6. Accept the RSA fingerprint prompt. Select **Always allow from this computer** only when the workstation is trusted.

Reload the Arch udev rules, reconnect the cable, and start ADB as the normal user:

```sh
sudo udevadm control --reload-rules
sudo udevadm trigger
adb kill-server
adb start-server
adb devices -l
```

The phone is ready when its row ends in `device`:

```text
List of devices attached
R58M123456A    device product:... model:... device:...
```

Never run `adb` with `sudo`. Doing so starts a root-owned ADB server and commonly creates later permission failures.

## 6. Build, install, and run the debug app

Keep exactly one Android device connected for the simplest workflow.

Start Metro in terminal 1 from the repository root:

```sh
cd apps/app
bun run start
```

In terminal 2, expose Metro over the USB connection, then build and install only the phone's native architecture:

```sh
cd apps/app
adb reverse tcp:8081 tcp:8081
bun run android -- --active-arch-only --no-packager
```

The React Native CLI installs and launches `com.yukikazeapp`. It normally configures `adb reverse` itself; the explicit command makes the USB development connection deterministic.

### Select one device when several are connected

Copy the serial from the first column of `adb devices -l`:

```sh
adb -s R58M123456A reverse tcp:8081 tcp:8081
bun run android -- --device R58M123456A --active-arch-only --no-packager
```

Use `--device`; `--deviceId` is deprecated by this project's React Native CLI.

## 7. Install a standalone local build

A release build embeds the JavaScript bundle and does not need Metro after installation:

```sh
cd apps/app
bun run android -- --mode release --no-packager
```

The current release variant uses the checked-in debug keystore. It is suitable only for local device testing, not distribution or Play Store publishing.

## Troubleshooting

### `adb devices` shows `unauthorized`

Unlock the phone and accept the RSA prompt. If no prompt appears:

1. Open **Developer options** on the phone.
2. Select **Revoke USB debugging authorizations**.
3. Disable and re-enable USB debugging.
4. Unplug and reconnect the cable.
5. Run `adb kill-server`, `adb start-server`, and `adb devices -l` again.

### `adb devices` is empty or reports `no permissions`

Confirm that the cable supports data, try another USB port, select the phone's file-transfer mode, and verify that the login session has the `adbusers` group:

```sh
id
sudo udevadm control --reload-rules
sudo udevadm trigger
adb kill-server
adb start-server
adb devices -l
```

Log out and back in if `adbusers` is missing from `id`, then reconnect the phone.

### The device reports `offline`

```sh
adb kill-server
adb start-server
adb devices -l
```

If it remains offline, unlock the phone, reconnect the cable, and accept the RSA prompt again.

### `pacman` reports 404 when installing packages

Refresh the package databases and complete a full system upgrade before installing Android packages:

```sh
sudo pacman -Syu
sudo pacman -S --needed android-udev jdk17-openjdk unzip
```

Arch removes old package files from mirrors after package updates. A 404 for a specific package archive usually means the local package database references a version that is no longer present on the mirror.

If the error continues after `pacman -Syu`, force-refresh the sync databases once:

```sh
sudo pacman -Syyu
sudo pacman -S --needed android-udev jdk17-openjdk unzip
```

### The app cannot connect to Metro

Confirm Metro is running on port 8081, then recreate the reverse tunnel:

```sh
adb reverse --remove tcp:8081
adb reverse tcp:8081 tcp:8081
```

### Gradle reports `SDK location not found`

Run the build from a shell that loaded `~/.bashrc`, then verify:

```sh
echo "$ANDROID_HOME"
test -x "$ANDROID_HOME/platform-tools/adb"
test -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
```

### Installation reports an incompatible existing signature

Remove the old package and reinstall. This deletes all Yukikaze app data stored on the phone:

```sh
adb uninstall com.yukikazeapp
bun run android -- --active-arch-only --no-packager
```

### Inspect native logs or open the developer menu

```sh
adb logcat '*:S' ReactNative:V ReactNativeJS:V
adb shell input keyevent 82
```

## References

- [React Native environment setup](https://reactnative.dev/docs/next/set-up-your-environment)
- [React Native: running on an Android device](https://reactnative.dev/docs/running-on-device)
- [Android: run apps on a hardware device](https://developer.android.com/studio/run/device)
- [Android Debug Bridge](https://developer.android.com/tools/adb)
- [Android SDK Manager](https://developer.android.com/tools/sdkmanager)
- [Arch Linux `android-udev` package](https://archlinux.org/packages/extra/any/android-udev/)
