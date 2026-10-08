import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SleepTimer from './SleepTimer';

describe('SleepTimer', () => {
  it('renders the main label "Sleep Timer"', () => {
    render(<SleepTimer onToggle={() => {}} />);
    expect(screen.getByText('Sleep Timer')).toBeInTheDocument();
  });

  it('renders all the button options (15m, 30m, 1h, 2h)', () => {
    render(<SleepTimer onToggle={() => {}} />);
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('1h')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('triggers the onToggle callback with the correct minutes parameter when an option is clicked', async () => {
    const onToggleMock = vi.fn();
    const user = userEvent.setup();
    render(<SleepTimer onToggle={onToggleMock} />);

    await user.click(screen.getByText('30m'));
    expect(onToggleMock).toHaveBeenCalledWith(30);

    await user.click(screen.getByText('1h'));
    expect(onToggleMock).toHaveBeenCalledWith(60);
  });

  it('applies the active css class to the button that matches the minutes prop', () => {
    render(<SleepTimer minutes={30} onToggle={() => {}} />);
    const activeBtn = screen.getByText('30m');
    const inactiveBtn = screen.getByText('15m');

    // Test that the active button has the active class. Because styles might be mocked or mangled,
    // we use a regex or string matching.
    expect(activeBtn.className).toContain('active');
    expect(inactiveBtn.className).not.toContain('active');
  });

  it('renders the countdown label correctly when the prop is provided', () => {
    render(<SleepTimer label="10:00 remaining" onToggle={() => {}} />);
    expect(screen.getByText('10:00 remaining')).toBeInTheDocument();
  });

  it('does not render the countdown label when the prop is not provided', () => {
    const { container } = render(<SleepTimer onToggle={() => {}} />);
    // Just finding that there are 4 spans inside doesn't necessarily mean it wasn't rendered.
    // Instead we can use queryByText and we shouldn't find anything matching the shape of a countdown label unless we provide one.
    // Wait, countdown label spans have the countdown class.
    const spans = container.querySelectorAll('span');
    // 1 label + 0 countdown
    expect(spans.length).toBe(1);
  });
});
