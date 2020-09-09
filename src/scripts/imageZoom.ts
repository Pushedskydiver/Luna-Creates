import pubSub from './modules/pubSub';

function ImageZoom(product: HTMLElement) {
  const isTouchDevice = 'ontouchstart' in document.documentElement;
  const button: HTMLButtonElement | null = product.querySelector('[data-image-zoom]');
  const modal: HTMLElement | null = product.querySelector('[data-modal="image-zoom"]');

  function showImageZoomModal(module: any) {
    const imageZoomModal = module.default;

    if (modal === null) return;

    imageZoomModal(modal).openModal(button);
  }

  function runTouchImageZoom(module: any) {
    const touchImageZoom = module.default;
    const picture = modal?.querySelector('[data-product-picture]') as HTMLElement;
    const pictureParent = picture.parentNode as HTMLElement;

    if (pictureParent.classList.contains('pinch-zoom-container')) return;

    const instance = new touchImageZoom(picture);

    return instance;
  }

  function runDesktopImageZoom(module: any) {
    const desktopImageZoom = module.default;

    desktopImageZoom(modal).init();
  }

  function handleImageZoom() {
    const zoom = modal?.querySelector('[data-modal-zoom]') as HTMLElement;

    if (isTouchDevice) {
      zoom.style.paddingTop = '0';
      import('pinch-zoom-js').then(runTouchImageZoom);
    } else {
      import('./desktopImageZoom').then(runDesktopImageZoom);
    }
  }

  function handleClick() {
    if (button === null) return;

    import('./modules/modal')
      .then(showImageZoomModal)
      .then(handleImageZoom);
  }

  function changeImageZoomSrc(picture: HTMLPictureElement) {
    const imagePath = picture.querySelector('img')?.srcset.split('_75x75')[0] as string;
    const image = modal?.querySelector('[data-product-image]') as HTMLElement;

    if (image === null && imagePath === undefined) return;

    image.style.backgroundImage = `url('${imagePath}.jpg')`;
  }

  function init() {
    if (button === null) return;

    button.addEventListener('click', handleClick);
    pubSub.subscribe('main/product/image/changed', changeImageZoomSrc);
  }

  return {
    init
  }
}

export default ImageZoom;
