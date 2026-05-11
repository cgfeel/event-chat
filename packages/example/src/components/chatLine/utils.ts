import { tv } from 'tailwind-variants'

export const baseStyle = tv({
  slots: {
    buttons: 'flex items-center justify-center p-4 pl-0',
    bar: 'flex h-16 bg-gray-700',
    corner:
      'absolute top-0 right-0 rounded-bl-lg bg-gray-600 px-2 text-sm shadow-md select-none text-shadow-lg',
    inputBox: 'flex flex-1 items-center',
    inputLine:
      'w-full p-0 pl-4 focus:outline-none disabled:cursor-not-allowed disabled:placeholder-gray-600',
    scroll: 'flex-1 overflow-auto px-4',
    selectUser: 'flex items-center justify-center',
    sendBtn: 'h-9 w-9 cursor-pointer rounded-full bg-gray-900 text-white',
    wrap: 'relative flex h-full flex-col',
  },
  variants: {
    disabled: {
      true: {
        bar: 'bg-gray-800',
        sendBtn: 'cursor-not-allowed bg-gray-600 text-gray-400',
      },
    },
    unRecipient: {
      true: {
        inputBox: 'pl-4',
      },
    },
  },
})
