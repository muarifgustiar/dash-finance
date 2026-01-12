# @repo/ui

Shared UI component library for Dash Finance applications. Built with React, TypeScript, Radix UI, and Tailwind CSS.

## Overview

This package provides a comprehensive set of accessible, composable UI components based on shadcn/ui patterns. All components are:
- ✅ Fully typed with TypeScript
- ✅ Accessible (ARIA compliant, keyboard navigation)
- ✅ Customizable via Tailwind classes
- ✅ Tree-shakeable for optimal bundle size
- ✅ Client-side components (Next.js 15 compatible)

## Installation

This is a workspace package. Import components directly in your app:

```tsx
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
```

## Components

### Form Components

#### Button
Versatile button with variants and sizes.
```tsx
import { Button } from "@repo/ui/button";

<Button variant="default" size="default">Click me</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
```

#### Input
Text input with label support.
```tsx
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="you@example.com" />
```

#### Textarea
Multi-line text input.
```tsx
import { Textarea } from "@repo/ui/textarea";

<Textarea placeholder="Enter description..." rows={4} />
```

#### Checkbox
Accessible checkbox with Radix UI.
```tsx
import { Checkbox } from "@repo/ui/checkbox";

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

#### Radio Group
Group of radio buttons.
```tsx
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";

<RadioGroup defaultValue="option-1">
  <div>
    <RadioGroupItem value="option-1" id="r1" />
    <label htmlFor="r1">Option 1</label>
  </div>
</RadioGroup>
```

#### Switch
Toggle switch component.
```tsx
import { Switch } from "@repo/ui/switch";

<Switch id="notifications" />
<label htmlFor="notifications">Enable notifications</label>
```

#### Select
Dropdown select component.
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Slider
Range slider input.
```tsx
import { Slider } from "@repo/ui/slider";

<Slider defaultValue={[50]} max={100} step={1} />
```

#### Form Primitives
Structured form field components.
```tsx
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@repo/ui/form";

<FormField name="username">
  <FormItem>
    <FormLabel>Username</FormLabel>
    <FormControl>
      <Input placeholder="johndoe" />
    </FormControl>
    <FormDescription>Your public display name</FormDescription>
    <FormMessage />
  </FormItem>
</FormField>
```

### Overlay Components

#### Dialog
Modal dialog with header, content, and footer.
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description here</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Alert Dialog
Confirmation dialog with actions.
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@repo/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Popover
Floating content container.
```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@repo/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div>Popover content</div>
  </PopoverContent>
</Popover>
```

#### Tooltip
Hover tooltip.
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@repo/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Dropdown Menu
Context menu and dropdown.
```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@repo/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Hover Card
Rich content on hover.
```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@repo/ui/hover-card";

<HoverCard>
  <HoverCardTrigger>@username</HoverCardTrigger>
  <HoverCardContent>
    <div>User profile information</div>
  </HoverCardContent>
</HoverCard>
```

### Navigation Components

#### Tabs
Tab navigation.
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion
Collapsible sections.
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@repo/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Collapsible
Simple collapse/expand.
```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@repo/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    <div>Collapsible content</div>
  </CollapsibleContent>
</Collapsible>
```

### Data Display

#### Card
Content container with sections.
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Table
Data table components.
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@repo/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Badge
Status badge.
```tsx
import { Badge } from "@repo/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Avatar
User avatar component.
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@repo/ui/avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Skeleton
Loading placeholder.
```tsx
import { Skeleton } from "@repo/ui/skeleton";

<Skeleton className="h-12 w-full" />
```

#### Separator
Visual divider.
```tsx
import { Separator } from "@repo/ui/separator";

<Separator />
<Separator orientation="vertical" />
```

### Feedback Components

#### Alert
Alert messages.
```tsx
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/alert";

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    This is an important message.
  </AlertDescription>
</Alert>
```

#### Toast
Toast notifications.
```tsx
// 1. Add Toaster to root layout
import { Toaster } from "@repo/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

// 2. Use toast hook in components
import { useToast } from "@repo/ui/use-toast";

function MyComponent() {
  const { toast } = useToast();
  
  return (
    <Button
      onClick={() => {
        toast({
          title: "Success!",
          description: "Your changes have been saved.",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
```

#### Progress
Progress bar.
```tsx
import { Progress } from "@repo/ui/progress";

<Progress value={60} />
```

### Utility Components

#### Code
Inline code display.
```tsx
import { Code } from "@repo/ui/code";

<Code>const example = true;</Code>
```

## Utilities

### cn() Function
Merge Tailwind classes safely.
```tsx
import { cn } from "@repo/ui/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

## Customization

All components accept `className` prop for custom styling:
```tsx
<Button className="w-full mt-4">Custom Button</Button>
```

## Accessibility

All components are built with accessibility in mind:
- Keyboard navigation support
- ARIA attributes
- Focus management
- Screen reader friendly

## Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Radix UI**: Accessible primitives
- **Tailwind CSS**: Styling
- **class-variance-authority**: Variant management

## Contributing

Components follow shadcn/ui patterns:
- Keep components composable and stateless
- Use Radix UI primitives for complex interactions
- Style with Tailwind utility classes
- Maintain TypeScript types
- Preserve accessibility features

## License

Private package for Dash Finance applications.
