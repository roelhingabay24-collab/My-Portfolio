export default function WorkflowPreview({ label, steps }) {
  return (
    <figure className="workflow-preview">
      <figcaption>{label}</figcaption>
      <ol className="workflow-preview-steps">
        {steps.map((step, index) => (
          <li key={step}>
            <span className="workflow-preview-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="workflow-preview-label">{step}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
