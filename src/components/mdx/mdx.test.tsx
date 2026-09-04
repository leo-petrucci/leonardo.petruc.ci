import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { Callout, CodeBlock, Steps, Tab, Tabs } from './index';

afterEach(cleanup);

describe('Callout', () => {
  it('defaults to the info variant', () => {
    const { getByRole } = render(<Callout>hello</Callout>);
    expect(getByRole('note').className).toContain('ascii-dashed-info');
  });

  it('applies the danger variant and title', () => {
    const { getByRole, getByText } = render(
      <Callout type="danger" title="Stop">
        body
      </Callout>,
    );
    expect(getByRole('note').className).toContain('ascii-dashed-danger');
    expect(getByText('[!!] danger')).toBeTruthy();
    expect(getByText('// Stop')).toBeTruthy();
  });
});

describe('CodeBlock', () => {
  it('renders code with a language badge', () => {
    const { getByText } = render(<CodeBlock code={'a\nb'} language="ts" />);
    expect(getByText('ts')).toBeTruthy();
    expect(getByText('b')).toBeTruthy();
  });

  it('highlights requested lines', () => {
    const { container } = render(<CodeBlock code={'a\nb\nc'} highlight="2" />);
    expect(container.textContent).toContain('bc');
    const highlighted = container.querySelectorAll('[class*="bg-blue-500"]');
    expect(highlighted.length).toBe(1);
  });
});

describe('Tabs', () => {
  it('renders one trigger per Tab child and shows only the active panel', () => {
    const { getByRole, getByText, queryByText } = render(
      <Tabs defaultValue="bun">
        <Tab value="bun">bun install</Tab>
        <Tab value="npm">npm install</Tab>
      </Tabs>,
    );
    expect(getByRole('tab', { name: 'bun' })).toBeTruthy();
    expect(getByRole('tab', { name: 'npm' })).toBeTruthy();
    expect(getByText('bun install')).toBeTruthy();
    expect(queryByText('npm install')).toBeNull();
  });

  it('defaults to the first tab when no defaultValue is given', () => {
    const { getByRole } = render(
      <Tabs>
        <Tab value="a">alpha</Tab>
        <Tab value="b">beta</Tab>
      </Tabs>,
    );
    expect(getByRole('tab', { name: 'a' }).getAttribute('data-state')).toBe(
      'active',
    );
  });
});

describe('Steps', () => {
  it('auto-numbers h3 steps', () => {
    const { getAllByRole } = render(
      <Steps>
        <h3>First</h3>
        <p>do a</p>
        <h3>Second</h3>
        <p>do b</p>
      </Steps>,
    );
    const numbers = getAllByRole('listitem').map((li) => li.firstChild?.textContent);
    expect(numbers).toEqual(['1', '2']);
  });
});
