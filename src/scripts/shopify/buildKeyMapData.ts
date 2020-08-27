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
  reader.onloadend = () => {
    const keyMapImage = reader.result as string;
    stateManager.keyMapCreated(keyMapImage);
  }
}

function buildLabelsData(color: FormDataEntryValue, keys: Array<FormDataEntryValue>, showKeyText: string, index: number) {
  if (showKeyText === 'no') {
    return {
      color,
      title: ' '
    }
  }

  return {
    color,
    title: keys.length > 0 ? keys[index] : ' '
  }
}

function buildKeyMapData(product: HTMLElement, formdata: FormData) {
  const type = product.getAttribute('data-product-color');
  const size = formdata.get('size')?.toString().split(' (')[0].toLowerCase();
  const title = formdata.get('title');
  const colors = formdata.getAll('colors').filter(color => color !== 'none');
  const showKeyText = formdata.get('show key text') as string;
  const keys = formdata.getAll('key');
  const labels = colors.map((color, index) => buildLabelsData(color, keys, showKeyText, index));

  const keyMapData = {
    type,
    title,
    frameSize: size === 'x-large' ? 'extraLarge' : size,
    labels
  }

  renderKeyMap(keyMapData);
  stateManager.showKeyMapModal();
}

export default buildKeyMapData;