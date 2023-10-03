import { type MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'

const GRID_SIZE = 10
const TILE_SIZE = 100

const rand = (num: number) => Math.floor(Math.random() * num)

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export function loader () {
  const initial = { direction: 'left', x: rand(GRID_SIZE), y: rand(GRID_SIZE) }
  const goal = { x: rand(GRID_SIZE), y: rand(GRID_SIZE) }
  return json({ initial, goal })
}

interface State {
  x: number
  y: number
  direction: 'up' | 'left' | 'down' | 'right'
}

type Instruction = 'forward' | 'left' | 'right'

export default function Index () {
  const { initial, goal } = useLoaderData<typeof loader>()
  const row = [...new Array(GRID_SIZE)]
  const [{ direction, x, y }, setState] = React.useState<State>(initial)
  const [current, setCurrent] = React.useState(-1)
  const [running, setRunning] = React.useState(false)
  const [instructions, setInstructions] = React.useState<Instruction[]>([])

  React.useEffect(() => {
    if (!running) return
    let i = -1
    let interval = setInterval(() => {
      i++
      if (i >= instructions.length) {
        clearInterval(interval)
      } else {
        const instr = instructions[i]
        if (instr === 'right') setState(turnRight)
        else if (instr === 'left') setState(turnLeft)
        else if (instr === 'forward') setState(move)
        setCurrent(i)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [instructions, running])
  return (
    <>
      <div className='absolute bottom-0 flex'>
        <button
          disabled={running}
          onClick={() => setRunning(true)}
          className='m-2 rounded-md bg-blue-200 p-5 hover:bg-blue-300 active:bg-blue-400 disabled:opacity-25'
        >
          Go!
        </button>
        <button
          disabled={!running}
          onClick={() => {
            setRunning(false)
            setState(initial)
            setCurrent(-1)
          }}
          className='m-2 rounded-md bg-red-200 p-5 hover:bg-blue-300 active:bg-blue-400 disabled:opacity-25'
        >
          Reset
        </button>
        <button
          disabled={running}
          onClick={() =>
            setInstructions(i => {
              const newInstr = [...i, 'left']
              if (newInstr.length > 36) newInstr.length = 36
              return newInstr
            })
          }
          className='m-2 rounded-md bg-blue-200 p-5 hover:bg-blue-300 active:bg-blue-400 disabled:opacity-25'
        >
          <Left />
        </button>
        <button
          disabled={running}
          onClick={() =>
            setInstructions(i => {
              const newInstr = [...i, 'right']
              if (newInstr.length > 36) newInstr.length = 36
              return newInstr
            })
          }
          className='m-2 rounded-md bg-blue-200 p-5 hover:bg-blue-300 active:bg-blue-400 disabled:opacity-25'
        >
          <Right />
        </button>
        <button
          disabled={running}
          onClick={() =>
            setInstructions(i => {
              const newInstr = [...i, 'forward']
              if (newInstr.length > 36) newInstr.length = 36
              return newInstr
            })
          }
          className='m-2 rounded-md bg-blue-200 p-5 hover:bg-blue-300 active:bg-blue-400 disabled:opacity-25'
        >
          <Forward />
        </button>
        <div className='flex flex-wrap pl-10'>
          {instructions.map((instr, i) => (
            <button
              key={i}
              className={
                'm-2 rounded-md p-5 hover:bg-slate-200' + (i === current ? ' bg-yellow-400' : '')
              }
              onClick={() =>
                setInstructions(instr => {
                  const newInstr = [...instr]
                  newInstr.splice(i, 1)
                  return newInstr
                })
              }
            >
              {instr === 'left' ? <Left /> : instr === 'right' ? <Right /> : <Forward />}
            </button>
          ))}
        </div>
      </div>
      <div className='relative ml-10 mt-10'>
        <div
          className={
            'absolute z-10 rounded-full border-2 border-white bg-purple-400 transition-all ' +
            (direction === 'left'
              ? '-rotate-90'
              : direction === 'down'
                ? 'rotate-180'
                : direction === 'right'
                  ? 'rotate-90'
                  : 'rotate-0')
          }
          style={{
            width: TILE_SIZE - 20,
            height: TILE_SIZE - 20,
            top: 10 + y * TILE_SIZE,
            left: 10 + x * TILE_SIZE
          }}
        >
          <div className='absolute left-4 top-3 h-4 w-4 rounded-full bg-black' />
          <div className='absolute right-4 top-3 h-4 w-4 rounded-full bg-black' />
        </div>
        <div
          className='absolute rounded-lg bg-yellow-700'
          style={{
            width: TILE_SIZE - 14,
            height: TILE_SIZE - 14,
            top: 5 + goal.y * TILE_SIZE,
            left: 5 + goal.x * TILE_SIZE
          }}
        />
        {row.map((_, i) => (
          <div key={i} className='flex'>
            {row.map((_, j) => (
              <div
                key={j}
                className={
                  'border-b-4 border-r-4 border-slate-200' +
                  (j === 0 ? ' border-l-4' : '') +
                  (i === 0 ? ' border-t-4' : '')
                }
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function turnRight ({ x, y, direction: oldDirection }: State): State {
  let direction
  if (oldDirection === 'up') direction = 'right'
  if (oldDirection === 'right') direction = 'down'
  if (oldDirection === 'down') direction = 'left'
  if (oldDirection === 'left') direction = 'up'
  return { x, y, direction }
}

function turnLeft ({ x, y, direction: oldDirection }: State): State {
  let direction
  if (oldDirection === 'up') direction = 'left'
  if (oldDirection === 'left') direction = 'down'
  if (oldDirection === 'down') direction = 'right'
  if (oldDirection === 'right') direction = 'up'
  return { x, y, direction }
}

function move ({ x, y, direction }: State): State {
  if (direction === 'up') return clamp({ x, y: y - 1, direction })
  if (direction === 'left') return clamp({ x: x - 1, y, direction })
  if (direction === 'down') return clamp({ x, y: y + 1, direction })
  if (direction === 'right') return clamp({ x: x + 1, y, direction })
}

function clamp ({ x, y, direction }: State): State {
  if (x < 0) x = 0
  if (y < 0) y = 0
  if (x >= GRID_SIZE) x = GRID_SIZE - 1
  if (y >= GRID_SIZE) y = GRID_SIZE - 1
  return { x, y, direction }
}

function Right () {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='h-6 w-6'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3'
      />
    </svg>
  )
}

function Left () {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='h-6 w-6'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'
      />
    </svg>
  )
}

function Forward () {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='h-6 w-6'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75'
      />
    </svg>
  )
}
