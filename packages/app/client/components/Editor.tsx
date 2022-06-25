import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { useEffect, useLayoutEffect, useRef } from 'react'
import defaultConfig from '../kit/defaultConfig'

type TProps = {
  value?: string
  onChange?: (v?: string) => void
  className?: string
}

function Editor(props: TProps) {
  const { value, onChange, className, ...otherProps } = props
  const monacoEl = useRef<HTMLDivElement>(null)
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  useEffect(() => {
    if (monacoEl.current) {
      editor = monaco.editor.create(monacoEl.current, {
        theme: 'vs-dark',
        value: value || defaultConfig.get(),
        language: 'typescript',
      })
      onChange && onChange(value || defaultConfig.get())
      editor.onDidChangeModelContent(() => {
        if (typeof onChange === 'function') {
          onChange(editor?.getValue())
        }
      })
    }
    return () => {
      editor?.dispose()
    }
  }, [])

  useLayoutEffect(() => {
    if (editor) {
      editor.setValue(value || '')
    }
  }, [value])

  return (
    <div
      ref={monacoEl}
      {...otherProps}
      className={`h-100% ${className || ''}`}
    ></div>
  )
}

export default Editor
