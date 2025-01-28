import { Select as SelectPrimitive } from "bits-ui";

import Root from "./select.svelte";
import Label from "./select-label.svelte";
import Item from "./select-item.svelte";
import Content from "./select-content.svelte";
import Trigger from "./select-trigger.svelte";
import Value from "./select-value.svelte";

const Group = SelectPrimitive.Group;
const Input = SelectPrimitive.Input;

export {
	Root,
	Group,
	Input,
	Label,
	Item,
	Value,
	Content,
	Trigger,
	//
	Root as Select,
	Group as SelectGroup,
	Input as SelectInput,
	Label as SelectLabel,
	Item as SelectItem,
	Value as SelectValue,
	Content as SelectContent,
	Trigger as SelectTrigger,
};
