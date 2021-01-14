import stateManager from './stateManager';

function fetchData(keyMapData: Object) {
  return fetch('https://api.pinmaps.co.uk/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(keyMapData)
  })
}

async function renderKeyMap(keyMapData: Object) {
  const data = await fetchData(keyMapData);
  const response = await data.blob();
  const reader = new FileReader();

  reader.readAsDataURL(response);
  reader.onloadend = () => stateManager.keyMapCreated(reader.result as string);
}

function formatColor(color: string) {
  switch (color) {
    case '#F8C3D3':
      return 'Pink';
    case '#84B6F9':
      return 'Light Blue';
    case '#538B65':
      return 'Green';
    case '#9D89E6':
      return 'Purple';
    case '#FFFFFF':
      return 'White';
    case '#EDD771':
      return 'Yellow';
    case '#DE3947':
      return 'Red';
    case '#475A88':
      return 'Blue';
    case '#ED8733':
      return 'Orange';
    default:
      return 'Black';
  }
}

function formatPins(pin: any) {
  const title = pin.title ? ` - ${pin.title}` : '';

  return `${formatColor(pin.color)}${title}`;
}

function buildPropertyData(product: HTMLElement, keyMapData: any) {
  const basketButton = product.querySelector('[data-add-to-basket]');
  const pins = keyMapData.labels.map(formatPins).join(' || ');
  const propertyData = [
    { key: 'Title', value: keyMapData.title },
    { key: 'Size', value: keyMapData.frameSize },
    { key: 'Pins', value: pins },
    { key: 'Type', value: keyMapData.type }
  ]

  if (basketButton === null) return;

  const customAttributes = JSON.stringify(propertyData);

  basketButton.setAttribute('data-variant-options', customAttributes);
}

function sortKeys(a: FormDataEntryValue, b: FormDataEntryValue) {
  if (a === '' || a === null) return 1;
  if (b === '' || b === null) return -1;

  return 0;
}

function buildLabelsData(color: FormDataEntryValue, index: number, keys: Array<FormDataEntryValue>, showKeyText: string) {
  const hex = color.toString();

  return {
    color: hex,
    title: showKeyText === 'yes' ? keys[index] : ''
  }
}

function buildKeyMapData(product: HTMLElement, formdata: FormData, target: HTMLButtonElement | null) {
  const type = product.getAttribute('data-product-color');
  const size = formdata.get('size')?.toString().split(' (')[0].toLowerCase();
  const title = formdata.get('title');
  const colors = formdata.getAll('color')
  const showKeyText = formdata.get('show key text') as string;
  const keys = formdata.getAll('pin label').sort(sortKeys);
  const labels = colors.map((color, index) => buildLabelsData(color, index, keys, showKeyText));

  console.log(colors, 'colors');
  console.log(keys, 'keys');
  console.log(labels, 'labels');

  const keyMapData = {
    title,
    frameSize: size === 'x-large' ? 'extraLarge' : size,
    labels,
    type
  }

  renderKeyMap(keyMapData);
  buildPropertyData(product, keyMapData);
  stateManager.showKeyMapModal(target as HTMLButtonElement);
}

export default buildKeyMapData;
