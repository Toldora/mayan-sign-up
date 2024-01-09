import { throttle } from 'lodash-es';

const burgerBtnRef = document.querySelector('.js-burger-btn');
const sidebarRef = document.querySelector('.js-app-sidebar');

const sidebarStyles = getComputedStyle(sidebarRef);

const state = {
  isOpenedSidebar: false,
  isDesktop: false,
};

const openSidebar = () => {
  state.isOpenedSidebar = true;

  sidebarRef.classList.add(
    'app-sidebar__overlay--animation',
    'app-sidebar__overlay--is-visible',
  );

  sidebarRef.addEventListener('click', onClickOverlay);
};

const closeSidebar = event => {
  event?.stopPropagation();

  state.isOpenedSidebar = false;

  const delay = Number.parseFloat(sidebarStyles.transitionDuration) * 1000;

  sidebarRef.classList.remove('app-sidebar__overlay--is-visible');

  sidebarRef.removeEventListener('click', onClickOverlay);

  setTimeout(() => {
    sidebarRef.classList.remove('app-sidebar__overlay--animation');
  }, delay);
};

const onClickBurgerBtn = event => {
  if (state.isOpenedSidebar) {
    closeSidebar(event);
    burgerBtnRef.classList.remove('app-navbar__burger-btn--is-open');
  } else {
    openSidebar();
    burgerBtnRef.classList.add('app-navbar__burger-btn--is-open');
  }
};

const onClickOverlay = event => {
  if (event.target !== event.currentTarget || !state.isOpenedSidebar) return;

  closeSidebar(event);
};

const handleResize = () => {
  const isDesktop = window.innerWidth >= 868;

  if (state.isDesktop !== isDesktop) {
    closeSidebar();
    burgerBtnRef.classList.remove('app-navbar__burger-btn--is-open');
  }

  state.isDesktop = isDesktop;
};

const handleResizeDebounced = throttle(handleResize, 300);
handleResize();
window.addEventListener('resize', handleResizeDebounced);
burgerBtnRef.addEventListener('click', onClickBurgerBtn);
