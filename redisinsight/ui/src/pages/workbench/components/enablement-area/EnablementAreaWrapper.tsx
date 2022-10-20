import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import cx from 'classnames'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import React, { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { fetchGuides, workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'
import { fetchTutorials, workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Nullable, } from 'uiSrc/utils'

import EnablementArea from './EnablementArea'
import EnablementAreaCollapse from './EnablementAreaCollapse/EnablementAreaCollapse'

import styles from './styles.module.scss'

export interface Props {
  isMinimized: boolean
  setIsMinimized: (value: boolean) => void
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  setScript: (script: string) => void
  onSubmit: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  isCodeBtnDisabled?: boolean
}

const EnablementAreaWrapper = (props: Props) => {
  const { isMinimized, setIsMinimized, scriptEl, setScript, isCodeBtnDisabled, onSubmit } = props
  const { loading: loadingGuides, items: guides } = useSelector(workbenchGuidesSelector)
  const { loading: loadingTutorials, items: tutorials } = useSelector(workbenchTutorialsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchGuides())
  }, [])

  useEffect(() => {
    dispatch(fetchTutorials())
  }, [])

  const sendEventButtonClickedTelemetry = (data?: Record<string, any>) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_COMMAND_CLICKED,
      eventData: {
        databaseId: instanceId,
        ...data,
      }
    })
  }

  const openScript = (
    script: string,
    execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams } = { mode: ExecuteButtonMode.Manual },
    file?: { path?: string, name?: string }
  ) => {
    sendEventButtonClickedTelemetry(file)

    if (execute.mode === ExecuteButtonMode.Auto) {
      onSubmit(script, null, { ...execute.params, clearEditor: false })
      return
    }

    setScript(script)
    setTimeout(() => {
      scriptEl?.focus()
      scriptEl?.setSelection(new monaco.Selection(0, 0, 0, 0))
    }, 0)
  }

  const onOpenInternalPage = ({ path }: IInternalPage) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_GUIDE_OPENED,
      eventData: {
        path,
        databaseId: instanceId,
      }
    })
  }

  return (
    <EuiFlexGroup
      className={cx(styles.areaWrapper, { [styles.minimized]: isMinimized })}
      onClick={() => isMinimized && setIsMinimized(false)}
      direction="column"
      responsive={false}
      gutterSize="none"
      data-testid="enablement-area-container"
    >
      <EuiFlexItem
        className={cx(styles.collapseWrapper, { [styles.minimized]: isMinimized })}
        grow={isMinimized}
      >
        <EnablementAreaCollapse isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      </EuiFlexItem>
      <EuiFlexItem
        className={cx(styles.areaContentWrapper, { [styles.minimized]: isMinimized })}
        grow={!isMinimized}
      >
        <EnablementArea
          guides={guides}
          tutorials={tutorials}
          loading={loadingGuides || loadingTutorials}
          openScript={openScript}
          onOpenInternalPage={onOpenInternalPage}
          isCodeBtnDisabled={isCodeBtnDisabled}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default React.memo(EnablementAreaWrapper)
