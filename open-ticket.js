const form = document.querySelector('#booking-form');

try {
  const encoded = location.hash.slice(1);
  if (!encoded || encoded.length > 40000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
    throw new Error('В ссылке нет данных выбранного поезда. Откройте ссылку из нового уведомления.');
  }
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (data.version !== 1 || typeof data.route !== 'string' || !data.route || data.route.length > 24000) {
    throw new Error('Ссылка не содержит корректную форму выбора мест. Выполните поиск заново.');
  }
  const returnUrl = new URL(String(data.returnUrl || '/ru/route/'), 'https://pass.rw.by');
  if (returnUrl.origin !== 'https://pass.rw.by' || returnUrl.pathname !== '/ru/route/' || returnUrl.username || returnUrl.password) {
    throw new Error('В ссылке указан некорректный адрес расписания. Выполните поиск заново.');
  }
  document.querySelector('#trip').textContent = `Поезд ${String(data.train || '')} · ${String(data.date || '')} · ${String(data.departure || '')}`;
  form.elements.namedItem('route').value = data.route;
  form.elements.namedItem('url').value = returnUrl.pathname + returnUrl.search;
  form.hidden = false;
  history.replaceState(null, '', location.pathname + location.search);
  form.requestSubmit();
} catch (error) {
  document.querySelector('#title').textContent = 'Не удалось открыть выбор мест';
  document.querySelector('#status').textContent = error instanceof SyntaxError || error instanceof TypeError
    ? 'Данные ссылки повреждены. Откройте ссылку из нового уведомления.'
    : error.message;
}

