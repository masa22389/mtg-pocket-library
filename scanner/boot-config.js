window.MTG_STORAGE_TEST=true;

document.documentElement.classList.toggle('embedded-scanner',new URLSearchParams(location.search).get('embedded')==='1'&&parent!==window);
