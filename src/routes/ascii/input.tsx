import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { AsciiInput } from '@/components/atoms/Ascii/AsciiInput';
import { AsciiFrameInput } from '@/components/atoms/Ascii/AsciiFrameInput';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/ascii/input')({
  component: RouteComponent,
});

function RouteComponent() {
  const [handle, setHandle] = useState('');
  const [token, setToken] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <AsciiBox frameColor="var(--border)" labelColor="var(--accent)" reveal fill>
        <h1>ASCII_INPUT_PROTOTYPE</h1>
        <AsciiBox.Rule />
        <p>
          Compact one-row inputs on a rectangular border. Spacing lands on
          whole character cells; focus tints border, caret and prompt accent.
        </p>
        <p className="text-ascii-sm">
          <Link to="/ascii/docs" className="underline">
            &lt; back to /ascii/docs
          </Link>
        </p>
      </AsciiBox>

      <AsciiBox label="states" padY={1} fill>
        <div className="flex flex-col gap-4">
          <AsciiInput label="plain" placeholder="type here..." prompt=">" />
          <AsciiInput
            label="with footer"
            footer="enter to submit"
            placeholder="search"
          />
          <AsciiInput
            label="password"
            type="password"
            placeholder="secret"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <AsciiInput label="disabled" disabled placeholder="not editable" />
          <AsciiInput
            label="invalid"
            aria-invalid="true"
            placeholder="bad value"
            footer="aria-invalid tints the border destructive"
          />
        </div>
      </AsciiBox>

      <AsciiBox label="live counter" padY={1} fill>
        <AsciiInput
          className="w-full"
          label="handle"
          prompt="@"
          placeholder="your_handle"
          value={handle}
          maxLength={24}
          onChange={(e) => setHandle(e.target.value)}
          footer={`${handle.length}/24 chars`}
        />
        <AsciiBox.Rule />
        <div className="flex items-center gap-3">
          <Button compact>CONFIRM</Button>
          <span className="text-ascii-sm text-muted-foreground">
            {handle ? `hello, @${handle}` : 'waiting for input...'}
          </span>
        </div>
      </AsciiBox>

      <AsciiBox label="legacy — frame inputs" padY={1} fill>
        <div className="flex flex-col gap-4">
          <AsciiFrameInput
            label="frame input"
            footer="three rows, kept for reference"
            placeholder="type here..."
            prompt=">"
          />
        </div>
      </AsciiBox>
    </div>
  );
}
