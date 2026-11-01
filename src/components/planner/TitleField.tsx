import { useRef, useState } from 'react';

/** The inline title box: Enter saves, Escape or an empty title cancels, leaving it saves what was typed. */
export function TitleField({
  label,
  className,
  onSave,
  onCancel,
  onText,
}: {
  label: string;
  className?: string;
  onSave: (title: string, viaEnter: boolean) => void;
  onCancel: (viaKey: boolean) => void;
  onText?: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const settled = useRef(false);

  const settle = (save: boolean, viaKey: boolean) => {
    if (settled.current) return;
    settled.current = true;
    const title = text.trim();
    if (save && title) onSave(title, viaKey);
    else onCancel(viaKey);
  };

  return (
    <input
      autoFocus
      className={className}
      value={text}
      placeholder="Title"
      aria-label={label}
      onChange={(e) => {
        setText(e.target.value);
        onText?.(e.target.value);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          settle(true, true);
        } else if (e.key === 'Escape') {
          settle(false, true);
        }
      }}
      onBlur={() => settle(true, false)}
    />
  );
}
