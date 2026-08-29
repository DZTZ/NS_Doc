import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './custom.css'

let overlay = null
let state = { scale: 1, tx: 0, ty: 0 }
let drag = { active: false, startX: 0, startY: 0, moved: false, suppressClick: false }

const MIN_SCALE = 1
const MAX_SCALE = 10
const WHEEL_FACTOR = 1.12

function createOverlay() {
  const el = document.createElement('div')
  el.className = 'ns-img-zoom-overlay'
  el.innerHTML = '<img class="ns-img-zoom-target" draggable="false" alt="" />'
  el.addEventListener('click', onOverlayClick)
  el.addEventListener('dblclick', resetTransform)
  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeZoom()
  })
  document.body.appendChild(el)
  return el
}

function getImg() {
  return overlay.querySelector('.ns-img-zoom-target')
}

function applyTransform(animated) {
  const img = getImg()
  img.classList.toggle('animated', Boolean(animated))
  img.style.transform = `translate3d(${state.tx}px, ${state.ty}px, 0) scale(${state.scale})`
}

function resetTransform() {
  state.scale = 1
  state.tx = 0
  state.ty = 0
  applyTransform(true)
}

function openZoom(img) {
  if (!overlay) overlay = createOverlay()
  const target = getImg()
  target.src = img.currentSrc || img.src
  target.alt = img.alt || ''
  resetTransform()
  overlay.classList.add('active')
  document.body.style.overflow = 'hidden'
}

function closeZoom() {
  if (!overlay) return
  overlay.classList.remove('active')
  document.body.style.overflow = ''
  resetTransform()
}

function onOverlayClick() {
  if (drag.suppressClick) {
    drag.suppressClick = false
    return
  }
  closeZoom()
}

function onWheel(e) {
  e.preventDefault()
  const rect = getImg().getBoundingClientRect()
  // 鼠标相对图片中心的偏移
  const mX = e.clientX - rect.left - rect.width / 2
  const mY = e.clientY - rect.top - rect.height / 2
  const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor))
  if (newScale === state.scale) return
  // 以鼠标位置为锚点：中心需平移 m * (1 - newScale / scale)
  state.tx += mX * (1 - newScale / state.scale)
  state.ty += mY * (1 - newScale / state.scale)
  state.scale = newScale
  applyTransform(false)
}

function onPointerDown(e) {
  e.preventDefault()
  drag.active = true
  drag.startX = e.clientX
  drag.startY = e.clientY
  drag.moved = false
  const img = getImg()
  img.setPointerCapture(e.pointerId)
  img.addEventListener('pointermove', onPointerMove)
  img.addEventListener('pointerup', onPointerUp)
  img.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(e) {
  if (!drag.active) return
  const dx = e.clientX - drag.startX
  const dy = e.clientY - drag.startY
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true
  drag.startX = e.clientX
  drag.startY = e.clientY
  state.tx += dx
  state.ty += dy
  applyTransform(false)
}

function onPointerUp() {
  drag.active = false
  if (drag.moved) {
    drag.suppressClick = true
    setTimeout(() => {
      drag.suppressClick = false
    }, 0)
  }
  const img = getImg()
  img.removeEventListener('pointermove', onPointerMove)
  img.removeEventListener('pointerup', onPointerUp)
  img.removeEventListener('pointercancel', onPointerUp)
}

function bindImages() {
  document.querySelectorAll('.vp-doc img').forEach((img) => {
    if (img.dataset.zoomBound) return
    img.dataset.zoomBound = '1'
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => openZoom(img))
  })
}

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    onMounted(bindImages)
    watch(
      () => route.path,
      () => nextTick(bindImages)
    )
  }
}
