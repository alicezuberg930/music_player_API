import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import {
  ToggleGroup,
  ToggleGroupIcon,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { Toggle, ToggleIcon } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bell,
  Bold,
  CircleAlert,
  Heart,
  Info,
  Italic,
  ListMusic,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Search,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Underline,
  Volume2,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { FadeIn } from 'react-native-reanimated';

import { useNavigation } from '@/hooks/use-navigation';

const APP_ICON = require('../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png');

type ShowcaseSectionProps = React.PropsWithChildren<{
  description: string;
  title: string;
}>;

function ShowcaseSection({
  children,
  description,
  title,
}: ShowcaseSectionProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="gap-1 p-5">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="gap-5 p-5">{children}</CardContent>
    </Card>
  );
}

function MainScreen() {
  const navigation = useNavigation();

  const [displayName, setDisplayName] = React.useState('Yukikaze Listener');
  const [verificationCode, setVerificationCode] = React.useState('123');
  const [notes, setNotes] = React.useState(
    'A focused mix for late-night coding.',
  );
  const [downloadEnabled, setDownloadEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [quality, setQuality] = React.useState('lossless');
  const [audioFormat, setAudioFormat] = React.useState<Option>({
    label: 'FLAC · Lossless',
    value: 'flac',
  });
  const [progress, setProgress] = React.useState(64);
  const [liked, setLiked] = React.useState(true);
  const [textStyles, setTextStyles] = React.useState<string[]>(['bold']);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [queueOpen, setQueueOpen] = React.useState(false);
  const [menuArtwork, setMenuArtwork] = React.useState(true);
  const [menuQuality, setMenuQuality] = React.useState('lossless');
  const [menubarValue, setMenubarValue] = React.useState<string | undefined>();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      testID="component-showcase"
    >
      <View className="mx-auto w-full max-w-3xl gap-6 px-4 pb-20 pt-6">
        <View className="gap-3 px-1">
          <View className="flex-row items-center gap-2">
            <Badge variant="secondary">
              <Icon as={Sparkles} size={12} />
              <Text>34 component modules</Text>
            </Badge>
          </View>
          <Text variant="h1" className="text-left text-4xl">
            Yukikaze UI
          </Text>
          <Text variant="lead">
            A native, interactive catalogue for the app component system.
          </Text>
        </View>

        <ShowcaseSection
          title="Foundations"
          description="Typography, icons, identity, layout, loading, and status primitives."
        >
          <View className="gap-3">
            <Text variant="h3">Typography</Text>
            <Text>
              Default text inherits color and typography from its parent.
            </Text>
            <Text variant="blockquote">
              Music gives shape to the quiet parts of a day.
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Text variant="small">Small label</Text>
              <Text variant="code">pnpm native</Text>
              <Text variant="muted">Muted metadata</Text>
            </View>
          </View>

          <Separator />

          <View className="gap-3">
            <Text variant="small">Badges and icon</Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Badge>
                <Text>Default</Text>
              </Badge>
              <Badge variant="secondary">
                <Text>Secondary</Text>
              </Badge>
              <Badge variant="destructive">
                <Text>Destructive</Text>
              </Badge>
              <Badge variant="outline">
                <Icon as={Music2} size={12} />
                <Text>Outline</Text>
              </Badge>
              <View className="h-6">
                <Separator orientation="vertical" />
              </View>
              <Icon as={Volume2} className="text-muted-foreground" size={20} />
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Avatar alt="Yukikaze app icon" className="size-14">
              <AvatarImage source={APP_ICON} />
              <AvatarFallback>
                <Text variant="small">YK</Text>
              </AvatarFallback>
            </Avatar>
            <Avatar alt="Listener avatar" className="size-14">
              <AvatarImage source={{ uri: '' }} />
              <AvatarFallback>
                <Text variant="small">LM</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1 gap-1">
              <Text variant="large">Avatar states</Text>
              <Text variant="muted">
                Local image and deterministic fallback
              </Text>
            </View>
          </View>

          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-xl bg-primary"
          >
            <View className="flex-1 items-center justify-center gap-3">
              <View className="rounded-full bg-primary-foreground/10 p-4">
                <Icon
                  as={Music2}
                  className="text-primary-foreground"
                  size={32}
                />
              </View>
              <Text className="text-primary-foreground" variant="large">
                16:9 artwork surface
              </Text>
            </View>
          </AspectRatio>

          <View className="gap-3">
            <Text variant="small">Skeleton</Text>
            <View className="flex-row items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </View>
            </View>
          </View>

          <NativeOnlyAnimatedView entering={FadeIn.duration(400)}>
            <View className="flex-row items-center gap-3 rounded-lg bg-muted p-3">
              <Icon as={Sparkles} className="text-muted-foreground" size={18} />
              <Text variant="muted" className="flex-1">
                NativeOnlyAnimatedView animates this row on iOS and Android.
              </Text>
            </View>
          </NativeOnlyAnimatedView>
        </ShowcaseSection>

        <ShowcaseSection
          title="Buttons"
          description="Every button treatment, including an icon-only action."
        >
          <View className="flex-row flex-wrap gap-3">
            <Button>
              <Icon as={Play} />
              <Text>Play</Text>
            </Button>
            <Button variant="secondary">
              <Text>Secondary</Text>
            </Button>
            <Button variant="outline">
              <Text>Outline</Text>
            </Button>
            <Button variant="ghost">
              <Text>Ghost</Text>
            </Button>
            <Button variant="destructive">
              <Icon as={Trash2} />
              <Text>Delete</Text>
            </Button>
            <Button variant="link">
              <Text>Open artist</Text>
            </Button>
            <Button size="sm">
              <Text>Small</Text>
            </Button>
            <Button size="lg">
              <Text>Large</Text>
            </Button>
            <Button
              size="icon"
              variant="outline"
              accessibilityLabel="More actions"
              onPress={() => navigation.navigate('Artist', { id: '123' })}
            >
              <Icon as={MoreHorizontal} size={18} />
            </Button>
          </View>
        </ShowcaseSection>

        <ShowcaseSection
          title="Forms"
          description="Inputs and controlled selection components with accessible labels."
        >
          <View className="gap-2">
            <Label nativeID="display-name-label">Display name</Label>
            <Input
              accessibilityLabelledBy="display-name-label"
              onChangeText={setDisplayName}
              placeholder="Enter a display name"
              value={displayName}
            />
          </View>

          <View className="gap-2">
            <Label nativeID="playlist-notes-label">Playlist notes</Label>
            <Textarea
              accessibilityLabelledBy="playlist-notes-label"
              onChangeText={setNotes}
              placeholder="Describe this playlist"
              value={notes}
            />
          </View>

          <View className="gap-2">
            <Label nativeID="verification-code-label">Verification code</Label>
            <InputOTP
              accessibilityLabelledBy="verification-code-label"
              maxLength={6}
              onChangeText={setVerificationCode}
              pattern={REGEXP_ONLY_DIGITS}
              value={verificationCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </View>

          <View className="gap-4 rounded-lg border border-border p-4">
            <View className="flex-row items-center gap-3">
              <Checkbox
                checked={downloadEnabled}
                onCheckedChange={setDownloadEnabled}
              />
              <Label
                className="flex-1"
                onPress={() => setDownloadEnabled(current => !current)}
              >
                Download new releases automatically
              </Label>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Label
                  onPress={() => setNotificationsEnabled(current => !current)}
                >
                  Release notifications
                </Label>
                <Text variant="muted">Alert when followed artists publish</Text>
              </View>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </View>
          </View>

          <View className="gap-3">
            <Label>Streaming quality</Label>
            <RadioGroup value={quality} onValueChange={setQuality}>
              <View className="flex-row items-center gap-3">
                <RadioGroupItem value="balanced" />
                <Label onPress={() => setQuality('balanced')}>Balanced</Label>
              </View>
              <View className="flex-row items-center gap-3">
                <RadioGroupItem value="lossless" />
                <Label onPress={() => setQuality('lossless')}>Lossless</Label>
              </View>
              <View className="flex-row items-center gap-3">
                <RadioGroupItem value="hi-res" />
                <Label onPress={() => setQuality('hi-res')}>Hi-res</Label>
              </View>
            </RadioGroup>
          </View>

          <View className="gap-2">
            <Label>Download format</Label>
            <Select value={audioFormat} onValueChange={setAudioFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a format" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectLabel>Lossless</SelectLabel>
                  <SelectItem label="FLAC · Lossless" value="flac" />
                  <SelectItem label="ALAC · Apple Lossless" value="alac" />
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Compressed</SelectLabel>
                  <SelectItem label="AAC · 320 kbps" value="aac" />
                  <SelectItem label="Opus · 256 kbps" value="opus" />
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        </ShowcaseSection>

        <ShowcaseSection
          title="Feedback and data"
          description="Alerts, toasts, progress, and a complete card composition."
        >
          <Alert icon={Info}>
            <AlertTitle>Library synced</AlertTitle>
            <AlertDescription>
              Your collection is available on this device.
            </AlertDescription>
          </Alert>
          <Alert icon={CircleAlert} variant="destructive">
            <AlertTitle>Connection interrupted</AlertTitle>
            <AlertDescription>
              Playback will continue from the offline cache.
            </AlertDescription>
          </Alert>

          <View className="gap-3">
            <Label>Toast notifications</Label>
            <View className="flex-row flex-wrap gap-3">
              <Button
                size="sm"
                variant="outline"
                onPress={() =>
                  toast('Track queued', {
                    description: 'Northern Signals will play next.',
                    action: {
                      label: 'Undo',
                      onPress: () => toast.info('Queue change reverted'),
                    },
                  })
                }
              >
                <Text>Default</Text>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => toast.success('Playlist saved')}
              >
                <Text>Success</Text>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => toast.error('Download failed')}
              >
                <Text>Error</Text>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => toast.info('New release available')}
              >
                <Text>Info</Text>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => toast.warning('Storage is almost full')}
              >
                <Text>Warning</Text>
              </Button>
              <Button
                size="sm"
                onPress={() => {
                  toast
                    .promise(Promise.resolve(), {
                      loading: 'Syncing library…',
                      success: 'Library synced',
                      error: 'Library sync failed',
                    })
                    .catch(() => undefined);
                }}
              >
                <Text>Promise</Text>
              </Button>
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label>Download progress</Label>
              <Text variant="muted">{progress}%</Text>
            </View>
            <Progress value={progress} />
            <Button
              className="self-start"
              size="sm"
              variant="outline"
              onPress={() =>
                setProgress(current => (current >= 100 ? 10 : current + 10))
              }
            >
              <Text>Advance</Text>
            </Button>
          </View>

          <Card className="gap-4 bg-muted/40 py-4">
            <CardHeader className="flex-row items-center gap-3 px-4">
              <View className="size-12 items-center justify-center rounded-lg bg-primary">
                <Icon
                  as={Music2}
                  className="text-primary-foreground"
                  size={22}
                />
              </View>
              <View className="flex-1 gap-1">
                <CardTitle>Midnight Architecture</CardTitle>
                <CardDescription>Yukikaze Radio</CardDescription>
              </View>
              <Badge variant="outline">
                <Text>FLAC</Text>
              </Badge>
            </CardHeader>
            <CardContent className="gap-2 px-4">
              <Progress value={42} />
              <View className="flex-row justify-between">
                <Text variant="muted">1:48</Text>
                <Text variant="muted">4:16</Text>
              </View>
            </CardContent>
            <CardFooter className="justify-center gap-3 px-4">
              <Button size="icon" variant="ghost" accessibilityLabel="Shuffle">
                <Icon as={Shuffle} size={18} />
              </Button>
              <Button size="icon" accessibilityLabel="Pause">
                <Icon as={Pause} size={18} />
              </Button>
              <Button size="icon" variant="ghost" accessibilityLabel="Share">
                <Icon as={Share2} size={18} />
              </Button>
            </CardFooter>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection
          title="Selection and navigation"
          description="Toggles, grouped controls, and controlled tab content."
        >
          <View className="flex-row flex-wrap items-center gap-3">
            <Toggle
              pressed={liked}
              onPressedChange={setLiked}
              variant="outline"
            >
              <ToggleIcon as={Heart} />
              <Text>{liked ? 'Liked' : 'Like'}</Text>
            </Toggle>
            <ToggleGroup
              type="multiple"
              value={textStyles}
              onValueChange={setTextStyles}
              variant="outline"
            >
              <ToggleGroupItem value="bold" isFirst accessibilityLabel="Bold">
                <ToggleGroupIcon as={Bold} />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" accessibilityLabel="Italic">
                <ToggleGroupIcon as={Italic} />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="underline"
                isLast
                accessibilityLabel="Underline"
              >
                <ToggleGroupIcon as={Underline} />
              </ToggleGroupItem>
            </ToggleGroup>
          </View>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="overview">
                <Text>Overview</Text>
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="tracks">
                <Text>Tracks</Text>
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="credits">
                <Text>Credits</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="rounded-lg bg-muted p-4">
              <Text variant="small">Overview</Text>
              <Text variant="muted" className="mt-2">
                Twelve carefully sequenced tracks for uninterrupted focus.
              </Text>
            </TabsContent>
            <TabsContent value="tracks" className="rounded-lg bg-muted p-4">
              <Text variant="small">12 tracks · 48 minutes</Text>
            </TabsContent>
            <TabsContent value="credits" className="rounded-lg bg-muted p-4">
              <Text variant="small">Curated by Yukikaze Radio</Text>
            </TabsContent>
          </Tabs>
        </ShowcaseSection>

        <ShowcaseSection
          title="Disclosure"
          description="Accordion and collapsible content with native interaction states."
        >
          <Accordion type="single" collapsible defaultValue="playback">
            <AccordionItem value="playback">
              <AccordionTrigger>
                <Text>How does gapless playback work?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">
                  Adjacent tracks are buffered before the current track ends.
                </Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="downloads">
              <AccordionTrigger>
                <Text>Where are downloads stored?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">
                  Offline audio remains inside the application sandbox.
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Collapsible open={queueOpen} onOpenChange={setQueueOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <Text>{queueOpen ? 'Hide queue' : 'Show queue'}</Text>
                <Icon as={ListMusic} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <View className="mt-3 gap-3 rounded-lg bg-muted p-4">
                <Text variant="small">Up next</Text>
                <Text variant="muted">01 · Northern Signals</Text>
                <Text variant="muted">02 · Glass Transit</Text>
                <Text variant="muted">03 · Quiet Machinery</Text>
              </View>
            </CollapsibleContent>
          </Collapsible>
        </ShowcaseSection>

        <ShowcaseSection
          title="Overlays"
          description="Dialogs and anchored surfaces rendered through the shared portal host."
        >
          <View className="flex-row flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Text>Dialog</Text>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Update the name displayed across your library.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  accessibilityLabel="Profile display name"
                  onChangeText={setDisplayName}
                  value={displayName}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">
                      <Text>Cancel</Text>
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>
                      <Text>Save</Text>
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Text>Alert dialog</Text>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove all downloads?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Streamed music and library metadata will remain available.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction>
                    <Text>Remove</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Icon as={SlidersHorizontal} />
                  <Text>Popover</Text>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <View className="gap-3">
                  <Text variant="large">Playback controls</Text>
                  <Text variant="muted">
                    Crossfade and normalization settings can live here.
                  </Text>
                  <Progress value={72} />
                </View>
              </PopoverContent>
            </Popover>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost">
                  <Text>Hover card</Text>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <View className="flex-row items-center gap-3">
                  <Avatar alt="Yukikaze Radio">
                    <AvatarImage source={{ uri: '' }} />
                    <AvatarFallback>
                      <Text variant="small">YR</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1 gap-1">
                    <Text variant="large">Yukikaze Radio</Text>
                    <Text variant="muted">24 curated stations</Text>
                  </View>
                </View>
              </HoverCardContent>
            </HoverCard>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  accessibilityLabel="Notifications information"
                >
                  <Icon as={Bell} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Text>Notifications</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </ShowcaseSection>

        <ShowcaseSection
          title="Menus"
          description="Dropdown, long-press context menu, and desktop-style menubar patterns."
        >
          <View className="flex-row flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Text>Dropdown menu</Text>
                  <Icon as={MoreHorizontal} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8}>
                <DropdownMenuLabel>Playback</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Icon as={Play} />
                    <Text>Play next</Text>
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon as={Share2} />
                    <Text>Share</Text>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={menuArtwork}
                  closeOnPress={false}
                  onCheckedChange={setMenuArtwork}
                >
                  <Text>Show artwork</Text>
                </DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup
                  value={menuQuality}
                  onValueChange={setMenuQuality}
                >
                  <DropdownMenuRadioItem value="balanced" closeOnPress={false}>
                    <Text>Balanced quality</Text>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lossless" closeOnPress={false}>
                    <Text>Lossless quality</Text>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Text>Add to playlist</Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Text>Night Drive</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Text>Deep Focus</Text>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon as={Trash2} />
                  <Text>Remove from library</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button variant="outline">
                  <Text>Long press</Text>
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent align="start">
                <ContextMenuLabel>Track actions</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem>
                    <Icon as={Play} />
                    <Text>Play now</Text>
                    <ContextMenuShortcut>↵</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Icon as={Search} />
                    <Text>Go to artist</Text>
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem
                  checked={menuArtwork}
                  closeOnPress={false}
                  onCheckedChange={setMenuArtwork}
                >
                  <Text>Show artwork</Text>
                </ContextMenuCheckboxItem>
                <ContextMenuRadioGroup
                  value={menuQuality}
                  onValueChange={setMenuQuality}
                >
                  <ContextMenuRadioItem value="balanced" closeOnPress={false}>
                    <Text>Balanced</Text>
                  </ContextMenuRadioItem>
                  <ContextMenuRadioItem value="lossless" closeOnPress={false}>
                    <Text>Lossless</Text>
                  </ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Text>Send to device</Text>
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>
                      <Text>Living room</Text>
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Text>Headphones</Text>
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive">
                  <Icon as={Trash2} />
                  <Text>Delete download</Text>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </View>

          <Menubar value={menubarValue} onValueChange={setMenubarValue}>
            <MenubarMenu value="library">
              <MenubarTrigger>
                <Text>Library</Text>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarLabel>Library</MenubarLabel>
                <MenubarGroup>
                  <MenubarItem>
                    <Icon as={Search} />
                    <Text>Search</Text>
                    <MenubarShortcut>⌘K</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    <Icon as={ListMusic} />
                    <Text>New playlist</Text>
                    <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarCheckboxItem
                  checked={menuArtwork}
                  closeOnPress={false}
                  onCheckedChange={setMenuArtwork}
                >
                  <Text>Show artwork</Text>
                </MenubarCheckboxItem>
                <MenubarItem variant="destructive">
                  <Icon as={Trash2} />
                  <Text>Clear library</Text>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu value="playback">
              <MenubarTrigger>
                <Text>Playback</Text>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarRadioGroup
                  value={menuQuality}
                  onValueChange={setMenuQuality}
                >
                  <MenubarRadioItem value="balanced" closeOnPress={false}>
                    <Text>Balanced</Text>
                  </MenubarRadioItem>
                  <MenubarRadioItem value="lossless" closeOnPress={false}>
                    <Text>Lossless</Text>
                  </MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Text>Output device</Text>
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>
                      <Text>This device</Text>
                    </MenubarItem>
                    <MenubarItem>
                      <Text>Living room</Text>
                    </MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ShowcaseSection>

        <Text variant="muted" className="px-1 text-center">
          Every UI module in apps/app/src/components/ui is represented above.
        </Text>
      </View>
    </ScrollView>
  );
}

export { MainScreen };
