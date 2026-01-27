import { type FC, type RefObject, useCallback, useEffect, useRef } from 'react';
import { tv } from 'tailwind-variants';

const trackName = 'scrollbar-track';
const scrollStyle = tv({
  slots: {
    thumb: 'scrollbar-thumb',
    track: `${trackName} hover:bg-black/10 data-[wheel=1]:pointer-events-auto data-[wheel=1]:visible`,
  },
  variants: {
    direction: {
      horizontal: {
        thumb: 'top-0 bottom-0',
        track: 'left-0 h-1.5 hover:h-2',
      },
      vertical: {
        thumb: 'right-0 left-0',
        track: 'top-0 w-1.5 hover:w-2',
      },
    },
  },
});

function debounce<T extends (...args: unknown[]) => unknown, D>(func: T, delay = 500) {
  let timer: null | NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: D[]) {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      func.apply(this, args);
      timer = null;
    }, delay);
  };
}

const getPointerCoord = (event: MouseEvent | TouchEvent | WheelEvent, axis: 'x' | 'y') => {
  if ('TouchEvent' in window && event instanceof TouchEvent) {
    return axis === 'x'
      ? event.touches[0]?.clientX || event.changedTouches[0]?.clientX
      : event.touches[0]?.clientY || event.changedTouches[0]?.clientY;
  }
  if (event instanceof MouseEvent || event instanceof WheelEvent)
    return axis === 'x' ? event.clientX : event.clientY;
  return 0;
};

const useScrollPosition: ScrollHooksType = (thumbRef, { direction, scroll, wrap }) => {
  const setThumbTop = useCallback(() => {
    const {
      clientHeight: viewportHeight = 0,
      scrollHeight = 0,
      scrollTop = 0,
    } = wrap.current ?? {};

    const { clientHeight = 0 } = scroll.current ?? {};
    const thumbBar = thumbRef.current;

    const thumbHeight = parseFloat(thumbRef.current?.style.height ?? '0');
    const contentHeight = scrollHeight - viewportHeight;

    if (thumbBar) {
      // 计算滑块顶部偏移（顶部偏移 = scrollTop / (内容总高 - 内容可视高) * (滑块可视高 - 滑块高)）
      const thumbTop =
        thumbHeight > 0 && contentHeight > 0
          ? (scrollTop / contentHeight) * (clientHeight - thumbHeight)
          : 0;

      thumbBar.style.top = `${thumbTop}px`;
    }
  }, [scroll, thumbRef, wrap]);

  const setThumbHeight = useCallback(() => {
    const { clientHeight: viewportHeight, scrollHeight } = wrap.current ?? {};
    const { clientHeight } = scroll.current ?? {};
    const thumbBar = thumbRef.current;

    if (thumbBar) {
      // 计算滑块高度（滑块高度 = 内容可视高度 / 内容总高度 * 滑块区域可视高度）
      thumbBar.style.height =
        viewportHeight && scrollHeight && clientHeight && viewportHeight < scrollHeight
          ? `${(viewportHeight / scrollHeight) * clientHeight}px`
          : '0';

      setThumbTop();
    }
  }, [scroll, thumbRef, wrap, setThumbTop]);

  const setThumbLeft = useCallback(() => {
    const { clientWidth: viewportWidth = 0, scrollWidth = 0, scrollLeft = 0 } = wrap.current ?? {};
    const { clientWidth = 0 } = scroll.current ?? {};
    const thumbBar = thumbRef.current;

    const thumbWidth = parseFloat(thumbRef.current?.style.width ?? '0');
    const contentWidth = scrollWidth - viewportWidth;

    if (thumbBar) {
      // 计算滑块左侧偏移（左侧偏移 = scrollLeft / (内容总宽 - 内容可视宽) * (滑块可视宽 - 滑块宽)）
      const thumbLeft =
        thumbWidth > 0 && contentWidth > 0
          ? (scrollLeft / contentWidth) * (clientWidth - thumbWidth)
          : 0;

      thumbBar.style.left = `${thumbLeft}px`;
    }
  }, [scroll, thumbRef, wrap]);

  const setThumbWidth = useCallback(() => {
    const { clientWidth: viewportWidth, scrollWidth } = wrap.current ?? {};
    const { clientWidth } = scroll.current ?? {};
    const thumbBar = thumbRef.current;

    if (scrollWidth && thumbBar) {
      // 计算滑块宽度（滑块宽度 = 内容可视宽度 / 内容总宽度 * 滑块区域+可视宽度）
      thumbBar.style.width =
        viewportWidth && clientWidth && viewportWidth < scrollWidth
          ? `${(viewportWidth / scrollWidth) * clientWidth}px`
          : '0';

      setThumbLeft();
    }
  }, [scroll, thumbRef, wrap, setThumbLeft]);

  useEffect(() => {
    const wrapBar = wrap.current;
    const tableBar = wrapBar?.querySelector('table');

    const getTumbPosition = direction === 'horizontal' ? setThumbLeft : setThumbTop;
    const getTumbSize = direction === 'horizontal' ? setThumbWidth : setThumbHeight;

    window.addEventListener('resize', getTumbSize);
    wrapBar?.addEventListener('scroll', getTumbPosition);

    const observer = new ResizeObserver(getTumbSize);
    getTumbSize();

    if (tableBar) observer.observe(tableBar);
    return () => {
      window.removeEventListener('resize', getTumbSize);
      wrapBar?.removeEventListener('scroll', getTumbPosition);

      if (tableBar) observer.unobserve(tableBar);
      observer.disconnect();
    };
  }, [direction, scroll, wrap, setThumbHeight, setThumbLeft, setThumbTop, setThumbWidth]);
};

const useThumbDrag: TrackHooksType = (thumbRef, { direction, wrap, moveTo }) => {
  const dragRef = useRef({
    client: 0,
    isDragging: false,
    start: 0,
  });

  const onClick = useCallback((event: Event) => {
    event.stopPropagation();
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current.isDragging = false;
  }, [dragRef]);

  const onLeftMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // 阻止默认行为（比如文本选中）
      event.preventDefault();

      dragRef.current = {
        client: getPointerCoord(event, 'x'),
        isDragging: true,
        start: parseFloat(thumbRef.current?.style.left ?? '0'),
      };
    },
    [dragRef, thumbRef]
  );

  const onLeftDragMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { client, isDragging, start } = dragRef.current;
      if (!isDragging) return;

      const { clientWidth: viewportWidth = 0, scrollWidth = 0 } = wrap.current ?? {};
      const { clientWidth = 0 } = thumbRef.current?.parentElement ?? {};
      const thumbWidth = parseFloat(thumbRef.current?.style.width ?? '0');

      // 计算鼠标移动的距离
      const deltaX = getPointerCoord(event, 'x') - client;
      const barStart = start + deltaX;

      const newLeft = Math.max(0, Math.min(barStart, clientWidth - thumbWidth));
      moveTo(
        'left',
        newLeft,
        (newLeft / (clientWidth - thumbWidth)) * (scrollWidth - viewportWidth)
      );
    },
    [dragRef, thumbRef, wrap, moveTo]
  );

  const onTopMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // 阻止默认行为（比如文本选中）
      event.preventDefault();

      dragRef.current = {
        client: getPointerCoord(event, 'y'),
        isDragging: true,
        start: parseFloat(thumbRef.current?.style.top ?? '0'),
      };
    },
    [thumbRef]
  );

  const onTopDragMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { client, isDragging, start } = dragRef.current;
      if (!isDragging) return;

      const { clientHeight: viewportHeight = 0, scrollHeight = 0 } = wrap.current ?? {};
      const { clientHeight = 0 } = thumbRef.current?.parentElement ?? {};
      const thumbHeight = parseFloat(thumbRef.current?.style.height ?? '0');

      // 计算鼠标移动的距离
      const deltaY = getPointerCoord(event, 'y') - client;
      const barStart = start + deltaY;

      const newTop = Math.max(0, Math.min(barStart, clientHeight - thumbHeight));
      moveTo(
        'top',
        newTop,
        (newTop / (clientHeight - thumbHeight)) * (scrollHeight - viewportHeight)
      );
    },
    [dragRef, thumbRef, wrap, moveTo]
  );

  useEffect(() => {
    const thumbbar = thumbRef.current;
    const onDragMove = direction === 'horizontal' ? onLeftDragMove : onTopDragMove;
    const onMouseDown = direction === 'horizontal' ? onLeftMouseDown : onTopMouseDown;

    // PC 端
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    thumbbar?.addEventListener('click', onClick);
    thumbbar?.addEventListener('mousedown', onMouseDown);

    // 移动端
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('touchcancel', onDragEnd);
    thumbbar?.addEventListener('touchstart', onMouseDown, {
      // 必须设为false，否则preventDefault会失效
      passive: false,
    });

    return () => {
      // PC 端
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      thumbbar?.removeEventListener('click', onClick);
      thumbbar?.removeEventListener('mousedown', onMouseDown);

      // 移动端
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
      document.removeEventListener('touchcancel', onDragEnd);
      thumbbar?.addEventListener('touchstart', onMouseDown);
    };
  }, [
    direction,
    thumbRef,
    onClick,
    onDragEnd,
    onLeftDragMove,
    onLeftMouseDown,
    onTopDragMove,
    onTopMouseDown,
  ]);
};

const useTrackClick: TrackHooksType = (thumbRef, { direction, wrap, moveTo }) => {
  const moveWrapLeft = useCallback(
    (event: PointerEvent) => {
      const { currentTarget } = event;
      const thumbbar = thumbRef.current;
      const thumbWidth = parseFloat(thumbbar?.style.width ?? '0');

      if (thumbbar && currentTarget instanceof HTMLDivElement && thumbWidth > 0) {
        const { clientWidth: viewportWidth = 0, scrollWidth = 0 } = wrap.current ?? {};
        const { clientWidth } = currentTarget;
        const trackRect = currentTarget.getBoundingClientRect();
        const clickX = event.clientX - trackRect.left;

        // 点击的位置是滚动条将要移动结果的中心点（中心点 - 滚动条 / 2 = 滚动条起点）
        const barStart = clickX - thumbWidth / 2;
        const newLeft = Math.max(0, Math.min(barStart, clientWidth - thumbWidth));
        moveTo(
          'left',
          newLeft,
          (newLeft / (clientWidth - thumbWidth)) * (scrollWidth - viewportWidth)
        );
      }
    },
    [thumbRef, wrap, moveTo]
  );

  const moveWrapTop = useCallback(
    (event: PointerEvent) => {
      const { currentTarget } = event;
      const thumbbar = thumbRef.current;
      const thumbHeight = parseFloat(thumbbar?.style.height ?? '0');

      if (thumbbar && currentTarget instanceof HTMLDivElement && thumbHeight > 0) {
        const { clientHeight: viewportHeight = 0, scrollHeight = 0 } = wrap.current ?? {};
        const { clientHeight } = currentTarget;
        const trackRect = currentTarget.getBoundingClientRect();
        const clickY = event.clientY - trackRect.top;

        // 点击的位置是滚动条将要移动结果的中心点（中心点 - 滚动条 / 2 = 滚动条起点）
        const barStart = clickY - thumbHeight / 2;
        const newTop = Math.max(0, Math.min(barStart, clientHeight - thumbHeight));
        moveTo(
          'top',
          newTop,
          (newTop / (clientHeight - thumbHeight)) * (scrollHeight - viewportHeight)
        );
      }
    },
    [thumbRef, wrap, moveTo]
  );

  useEffect(() => {
    const thumbbar = thumbRef.current;
    const trackBar = thumbbar?.closest(`.${trackName}`);
    const clickHandle = direction === 'horizontal' ? moveWrapLeft : moveWrapTop;

    if (trackBar instanceof HTMLDivElement) trackBar.addEventListener('click', clickHandle);
    return () => {
      if (trackBar instanceof HTMLDivElement) trackBar.removeEventListener('click', clickHandle);
    };
  }, [direction, thumbRef, moveWrapLeft, moveWrapTop]);
};

const useWheel: WheelHooksType = (thumbRef, { direction, wrap }) => {
  const hoverRef = useRef(false);
  const enterHandle = useCallback(() => {
    hoverRef.current = true;
  }, []);

  const stopHandle = useCallback(() => {
    const parent = thumbRef.current?.parentElement;
    if (parent && !hoverRef.current) {
      Reflect.deleteProperty(parent.dataset, 'wheel');
    }
  }, [thumbRef]);

  const debounceHandle = debounce(stopHandle);
  const leaveHandle = useCallback(() => {
    hoverRef.current = false;
    debounceHandle();
  }, [debounceHandle]);

  const wheelHandle = useCallback(
    (event: WheelEvent | TouchEvent) => {
      const { currentTarget } = event;
      if (currentTarget instanceof HTMLElement) {
        const { clientHeight, clientWidth, scrollHeight, scrollWidth } = currentTarget;
        const delta = getPointerCoord(event, direction === 'horizontal' ? 'x' : 'y');
        const parent = thumbRef.current?.parentElement;

        const diff =
          direction === 'horizontal' ? scrollWidth - clientWidth : scrollHeight - clientHeight;

        if (diff > 0 && delta && parent) {
          parent.dataset.wheel = '1';
          debounceHandle();
        }
      }
    },
    [direction, thumbRef, debounceHandle]
  );

  useEffect(() => {
    const trackBar = thumbRef.current?.parentElement;
    const wrapbar = wrap.current;

    wrapbar?.addEventListener('wheel', wheelHandle, { passive: false });
    wrapbar?.addEventListener('touchstart', wheelHandle, { passive: true });
    wrapbar?.addEventListener('touchmove', wheelHandle, { passive: false });
    trackBar?.addEventListener('mouseenter', enterHandle);
    trackBar?.addEventListener('mouseleave', leaveHandle);
    return () => {
      wrapbar?.removeEventListener('wheel', wheelHandle);
      wrapbar?.removeEventListener('touchstart', wheelHandle);
      wrapbar?.removeEventListener('touchmove', wheelHandle);
      trackBar?.removeEventListener('mouseenter', enterHandle);
      trackBar?.removeEventListener('mouseleave', leaveHandle);
    };
  }, [thumbRef, wrap, enterHandle, leaveHandle, wheelHandle]);
};

const ScrollVirtual: FC<ScrollVirtualProps> = ({ scroll, wrap, direction = 'vertical' }) => {
  const { thumb, track } = scrollStyle({ direction });
  const thumbRef = useRef<HTMLDivElement>(null);

  const moveTo: OptionsType['moveTo'] = useCallback(
    (position, barTo, scrollTo) => {
      const thumbbar = thumbRef.current;
      if (thumbbar) {
        thumbbar.style[position] = `${barTo}px`;
        wrap.current?.scrollTo(
          position === 'left'
            ? { left: scrollTo, top: 0 }
            : {
                left: 0,
                top: scrollTo,
              }
        );
      }
    },
    [thumbRef, wrap]
  );

  useScrollPosition(thumbRef, { direction, scroll, wrap });
  useThumbDrag(thumbRef, { direction, wrap, moveTo });
  useTrackClick(thumbRef, { direction, wrap, moveTo });
  useWheel(thumbRef, { direction, wrap });

  return (
    <div className={track()}>
      <div className={thumb()} ref={thumbRef} />
    </div>
  );
};

export default ScrollVirtual;

interface ScrollVirtualProps {
  scroll: RefObject<HTMLElement>;
  wrap: RefObject<HTMLElement>;
  direction?: 'horizontal' | 'vertical';
}

type ScrollHooksType = (thumb: RefObject<HTMLElement>, ops: Required<ScrollVirtualProps>) => void;
type TrackHooksType = (thumb: RefObject<HTMLElement>, ops: OptionsType) => void;
type WheelHooksType = (
  thumb: RefObject<HTMLElement>,
  ops: Omit<Required<ScrollVirtualProps>, 'scroll'>
) => void;

type OptionsType = Omit<Required<ScrollVirtualProps>, 'scroll'> & {
  moveTo: (position: 'left' | 'top', barTo: number, scrollTo: number) => void;
};
