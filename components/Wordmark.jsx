// Recreates the logo's actual lettering as real text (not an image), so
// it stays crisp, selectable, and theme-adaptive — colors sampled directly
// from the provided logo artwork.
export default function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wm-my">my</span>
      <span className="wm-vibe">vibe</span>
      <span className="wm-bar">.bar</span>
    </span>
  );
}
