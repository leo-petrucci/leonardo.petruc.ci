import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExampleWrap } from '@/components/docs/shared';
export function AvatarDoc() {
  return (
    <ExampleWrap
      title="Avatar"
      description="Image with fallback. Use fallback for initials."
      code={`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
    >
      <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>LP</AvatarFallback></Avatar>
    </ExampleWrap>
  );
}
