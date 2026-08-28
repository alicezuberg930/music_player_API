import * as Accordion from '@/components/ui/accordion';
import * as AlertDialog from '@/components/ui/alert-dialog';
import * as Alert from '@/components/ui/alert';
import * as AspectRatio from '@/components/ui/aspect-ratio';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as Checkbox from '@/components/ui/checkbox';
import * as Collapsible from '@/components/ui/collapsible';
import * as ContextMenu from '@/components/ui/context-menu';
import * as Dialog from '@/components/ui/dialog';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as HoverCard from '@/components/ui/hover-card';
import * as Icon from '@/components/ui/icon';
import * as Input from '@/components/ui/input';
import * as InputOTP from '@/components/ui/input-otp';
import * as Label from '@/components/ui/label';
import * as Menubar from '@/components/ui/menubar';
import * as NativeOnlyAnimatedView from '@/components/ui/native-only-animated-view';
import * as Popover from '@/components/ui/popover';
import * as Progress from '@/components/ui/progress';
import * as RadioGroup from '@/components/ui/radio-group';
import * as Select from '@/components/ui/select';
import * as Separator from '@/components/ui/separator';
import * as Skeleton from '@/components/ui/skeleton';
import * as Switch from '@/components/ui/switch';
import * as Tabs from '@/components/ui/tabs';
import * as Text from '@/components/ui/text';
import * as Textarea from '@/components/ui/textarea';
import * as ToggleGroup from '@/components/ui/toggle-group';
import * as Toggle from '@/components/ui/toggle';
import * as Tooltip from '@/components/ui/tooltip';
import * as Toast from '@/components/ui/toast';

const componentModules = [
  Accordion,
  AlertDialog,
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapsible,
  ContextMenu,
  Dialog,
  DropdownMenu,
  HoverCard,
  Icon,
  Input,
  InputOTP,
  Label,
  Menubar,
  NativeOnlyAnimatedView,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  Text,
  Textarea,
  ToggleGroup,
  Toggle,
  Tooltip,
  Toast,
];

test('loads the complete component registry', () => {
  expect(componentModules).toHaveLength(34);
  expect(
    componentModules.every(
      componentModule => Object.keys(componentModule).length > 0,
    ),
  ).toBe(true);
});
