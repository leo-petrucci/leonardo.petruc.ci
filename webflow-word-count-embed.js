(() => {
  const endpoint = 'PASTE_YOUR_LAMBDA_FUNCTION_URL_HERE';
  const element = document.querySelector('[data-wordcount="total"]');

  if (!element || endpoint === 'PASTE_YOUR_LAMBDA_FUNCTION_URL_HERE') {
    return;
  }

  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Word count request failed: ${response.status}`);
      }

      return response.json();
    })
    .then(({ total }) => {
      if (!Number.isFinite(total)) {
        return;
      }

      const finalValue = Math.round(total);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = finalValue.toLocaleString();
        return;
      }

      const startedAt = performance.now();
      const duration = 1200;

      function render(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = Math.round(finalValue * eased).toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(render);
        }
      }

      requestAnimationFrame(render);
    })
    .catch(() => {
      // Preserve the page's placeholder when the vanity metric is unavailable.
    });
})();
