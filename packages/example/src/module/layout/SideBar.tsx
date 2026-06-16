import logoPNG from '@/stories/assets/EventChatWhite.png'
import {
  ContainerOutlined,
  GithubOutlined,
  LinkOutlined,
  MergeCellsOutlined,
  SignatureOutlined,
  SplitCellsOutlined,
} from '@ant-design/icons'
import { type FC, type PropsWithChildren, useState } from 'react'
import { tv } from 'tailwind-variants'

const doclink =
  process.env.NODE_ENV === 'production' ? `/event-chat/storybook-static/` : `http://localhost:6006/`

const styles = tv({
  slots: {
    logo: 'fill-white',
    link: 'flex cursor-pointer justify-between rounded-md p-2 hover:bg-slate-700 [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:transition-all [&>a]:duration-300 [&>a]:ease-in-out',
    list: 'flex flex-col gap-4 px-2',
    main: 'flex-1 shrink basis-auto overflow-auto',
    menu: 'absolute top-0 flex w-full flex-col gap-6 px-2 py-4',
    side: 'transition-basis relative flex-0 shrink-0 bg-slate-900 duration-300 ease-in-out',
    sidebar: 'transition-width fixed top-0 bottom-0 left-0 duration-300 ease-in-out',
    tag: '',
    toggle: 'flex h-8 w-8 cursor-pointer justify-center rounded-md align-middle hover:bg-slate-800',
    toolbar: 'absolute right-0 bottom-0 left-0 flex justify-end p-1',
    warp: 'flex',
  },
  variants: {
    activate: {
      true: {
        link: 'cursor-auto bg-slate-100 text-base font-bold text-slate-900 hover:bg-slate-100',
      },
    },
    open: {
      true: {
        link: '[&>a]:flex-row [&>a]:justify-start',
        menu: 'gap-6',
        side: 'basis-50',
        sidebar: 'w-50',
      },
      false: {
        link: '[&>a]:flex-col [&>a]:justify-center',
        logo: 'scale-75',
        menu: 'gap-3',
        side: 'basis-20',
        sidebar: 'w-20',
        tag: 'hidden',
      },
    },
  },
})

const LogoSvg = () => (
  <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <g transform="translate(1 1) scale(1)">
      <g transform="translate(1 1) scale(0.2465753424657534)">
        <g>
          <path
            id="fill_x5F_1"
            fill="transparent"
            d="M152.654,446.175l147.917,102.353l147.19-102.574l101.047-146.028L445.777,152.078 L299.747,51.031L153.663,152.833L51.31,300.75L152.654,446.175z"
          />
          <path
            id="frame_x5F_1_7_"
            d="M0.682,354.463l144.073,99.694l101.522,145.681l54.312-37.849l54.307,37.579l100.795-145.666 l143.986-100.341l-37.409-53.681L600,245.354L453.741,144.147L353.401,0.161l-53.68,37.408l-53.935-37.32L145.681,144.917L0,246.438 l37.849,54.312L0.682,354.463z M26.999,349.672l22.392-32.36l64.406,92.421L26.999,349.672z M250.981,573.506l-61.7-88.538 l94.709,65.535L250.981,573.506z M350.105,573.252l-32.954-22.803l94.118-65.589L350.105,573.252z M573.345,348.857l-86.842,60.518 l64.279-92.894L573.345,348.857z M573.684,250.145l-22.956,33.175l-66.029-94.75L573.684,250.145z M348.696,26.494l60.518,86.842 l-92.894-64.28L348.696,26.494z M250.578,26.566l32.582,22.546l-93.055,64.848L250.578,26.566z M159.294,158.485l140.465-97.887 l140.413,97.161l99.069,142.161L442.08,440.332l-141.53,98.629l-142.228-98.417L60.877,300.713L159.294,158.485z M26.333,251.143 l88.537-61.7l-65.534,94.708L26.333,251.143z"
            fill="currentColor"
          />
        </g>
      </g>
      <g>
        <g transform="scale(0.15119037194906756) translate(210 190)">
          <path
            id="color_x5F_1_2_"
            fill="currentColor"
            d="M402.112,138.402l75.065-60.104l15.498,30.196L402.112,138.402z M497.535,185.176 l2.805-31.24l-85.201,19.461L497.535,185.176z M424.829,29.585l-47.986,69.798l71.418-48.181L424.829,29.585z M98.011,475.694 l10.393,32.311l85.186-45.072L98.011,475.694z M159.19,565.663l49.934-66.592l-74.007,46.486L159.19,565.663z M96.219,404.233 l-1.283,31.854l84.569-16.431L96.219,404.233z M595.276,563.317l-31.947,10.278c-1.089,0.349-13.826,4.315-31.029,4.315 c-17.023,0-38.42-3.883-57.229-18.998c-23.599,10.908-49.56,16.64-75.641,16.64c-99.39,0-180.249-80.859-180.249-180.248 c0-6.464,0.359-12.845,1.026-19.135c-7.974,1.083-16.096,1.692-24.363,1.692c-26.081,0-52.042-5.732-75.639-16.642 c-18.81,15.115-40.209,19-57.232,19c-17.204,0-29.939-3.966-31.026-4.316L0,365.626l30.472-14.063 c19.756-9.119,24.731-21.328,28.667-36.522c-28.132-32.704-43.542-74.123-43.542-117.428c0-99.389,80.859-180.248,180.248-180.248 c99.39,0,180.249,80.859,180.249,180.248c0,6.464-0.359,12.845-1.026,19.135c7.974-1.083,16.096-1.692,24.362-1.692 c99.389,0,180.248,80.859,180.248,180.248c0,43.304-15.411,84.723-43.543,117.428c3.938,15.194,8.91,27.403,28.669,36.522 L595.276,563.317z M257.646,198.779c0,14.054,11.393,25.447,25.447,25.447c14.054,0,25.447-11.393,25.447-25.447 c0-14.054-11.393-25.447-25.447-25.447C269.039,173.331,257.646,184.725,257.646,198.779z M134.046,198.779 c0-14.054-11.393-25.447-25.447-25.447c-14.054,0-25.447,11.393-25.447,25.447c0,14.054,11.393,25.447,25.447,25.447 C122.652,224.226,134.046,212.833,134.046,198.779z M222.653,198.779h-50.894c0,14.054,11.393,25.447,25.447,25.447 C211.26,224.226,222.653,212.833,222.653,198.779z M507.376,505.418l4.81-5.168c26.645-28.615,41.319-65.885,41.319-104.946 c0-84.957-69.116-154.074-154.074-154.074s-154.075,69.116-154.075,154.074s69.117,154.074,154.075,154.074 c25.278,0,49.396-5.953,71.685-17.699l8.561-4.509l6.823,6.863c11.877,11.95,26.323,16.314,38.903,17.413 c-9.843-12.527-13.234-26.411-16.184-38.492L507.376,505.418z M486.679,355.753c-20.046,0-36.354,16.308-36.354,36.354h21.812 c0-8.018,6.524-14.542,14.542-14.542c8.017,0,14.54,6.524,14.54,14.542h21.812C523.03,372.061,506.723,355.753,486.679,355.753z M312.184,355.753c-20.046,0-36.354,16.308-36.354,36.354h21.812c0-8.018,6.524-14.542,14.542-14.542s14.54,6.524,14.54,14.542 h21.812C348.536,372.061,332.228,355.753,312.184,355.753z M398.07,417.554c14.054,0,25.447-11.393,25.447-25.447h-50.894 C372.623,406.161,384.016,417.554,398.07,417.554z"
          />
        </g>
      </g>
    </g>
  </svg>
)

const SideBar: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { link, list, logo, main, menu, side, sidebar, tag, toggle, toolbar, warp } = styles({
    open,
  })

  return (
    <div className={warp()}>
      <aside className={side()}>
        <div className={sidebar()}>
          <div className={menu()}>
            <div className={logo()}>
              {!open ? <LogoSvg /> : <img alt="logo" height={48.41} src={logoPNG} width={156} />}
            </div>
            <nav>
              <ul className={list()}>
                <li className={link({ activate: true })}>
                  <a>
                    <SignatureOutlined />
                    演示
                  </a>
                </li>
                <li className={link()}>
                  <a href={`${doclink}?path=/docs/get-started--docs`} target="event-chat">
                    <ContainerOutlined />
                    文档
                  </a>
                  <span className={tag()}>
                    <LinkOutlined />
                  </span>
                </li>
                <li className={link()}>
                  <a href="https://github.com/event-chat/event-chat" target="event-chat">
                    <GithubOutlined />
                    <span>仓库</span>
                  </a>
                  <span className={tag()}>
                    <LinkOutlined />
                  </span>
                </li>
              </ul>
            </nav>
          </div>
          <div className={toolbar()}>
            <button className={toggle()} type="button" onClick={() => setOpen(!open)}>
              {open ? <MergeCellsOutlined /> : <SplitCellsOutlined />}
            </button>
          </div>
        </div>
      </aside>
      <main className={main()}>{children}</main>
    </div>
  )
}

export default SideBar
