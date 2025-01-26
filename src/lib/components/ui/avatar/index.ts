import { Avatar as AvatarPrimitive } from "bits-ui";
import Root from "./avatar.svelte";
import Image from "./avatar-image.svelte";
import Fallback from "./avatar-fallback.svelte";

const Avatar = AvatarPrimitive.Root;
const AvatarImage = AvatarPrimitive.Image;
const AvatarFallback = AvatarPrimitive.Fallback;

export {
    Avatar,
    AvatarImage,
    AvatarFallback,
    //
    Root,
    Image,
    Fallback,
    //
    Root as AvatarRoot,
    Image as AvatarImageRoot,
    Fallback as AvatarFallbackRoot
}; 