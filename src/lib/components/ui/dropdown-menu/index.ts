import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import Item from "./dropdown-menu-item.svelte";
import Content from "./dropdown-menu-content.svelte";
import Label from "./dropdown-menu-label.svelte";
import Separator from "./dropdown-menu-separator.svelte";

const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuPrimitive.Trigger;

export {
    Root as DropdownMenu,
    Trigger as DropdownMenuTrigger,
    Content as DropdownMenuContent,
    Item as DropdownMenuItem,
    Label as DropdownMenuLabel,
    Separator as DropdownMenuSeparator
}; 