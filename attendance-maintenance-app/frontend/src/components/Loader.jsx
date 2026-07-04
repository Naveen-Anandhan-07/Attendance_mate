export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
