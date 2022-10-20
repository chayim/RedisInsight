import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

import { Nullable } from 'uiSrc/utils'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import InstanceHeader from 'uiSrc/components/instance-header'
import QueryWrapper from 'uiSrc/components/query'
import {
  setWorkbenchVerticalPanelSizes,
  appContextWorkbench
} from 'uiSrc/slices/app/context'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import WBResultsWrapper from '../../wb-results'
import EnablementAreaWrapper from '../../enablement-area'

import styles from './styles.module.scss'

const verticalPanelIds = {
  firstPanelId: 'scriptingArea',
  secondPanelId: 'resultsArea'
}

export interface Props {
  script: string
  items: CommandExecutionUI[]
  setScript: (script: string) => void
  setScriptEl: Function
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  scrollDivRef: Ref<HTMLDivElement>
  activeMode: RunQueryMode
  resultsMode: ResultsMode
  onSubmit: (query?: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  onQueryOpen: (commandId?: string) => void
  onQueryDelete: (commandId: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
}

const WBView = (props: Props) => {
  const {
    script = '',
    items,
    setScript,
    setScriptEl,
    scriptEl,
    activeMode,
    resultsMode,
    onSubmit,
    onQueryOpen,
    onQueryDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    scrollDivRef,
  } = props
  const [isMinimized, setIsMinimized] = useState<boolean>(
    localStorageService?.get(BrowserStorageItem.isEnablementAreaMinimized) ?? false
  )
  const [isCodeBtnDisabled, setIsCodeBtnDisabled] = useState<boolean>(false)

  const { panelSizes: { vertical } } = useSelector(appContextWorkbench)

  const verticalSizesRef = useRef(vertical)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setWorkbenchVerticalPanelSizes(verticalSizesRef.current))
  }, [])

  useEffect(() => {
    localStorageService.set(BrowserStorageItem.isEnablementAreaMinimized, isMinimized)
  }, [isMinimized])

  const onVerticalPanelWidthChange = useCallback((newSizes: any) => {
    verticalSizesRef.current = newSizes
  }, [])

  return (
    <div className={cx('workbenchPage', styles.container)}>
      <InstanceHeader />
      <div className={styles.main}>
        <div className={cx(styles.sidebar, { [styles.minimized]: isMinimized })}>
          <EnablementAreaWrapper
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            setScript={setScript}
            onSubmit={onSubmit}
            scriptEl={scriptEl}
            isCodeBtnDisabled={isCodeBtnDisabled}
          />
        </div>
        <div className={cx(styles.content, { [styles.minimized]: isMinimized })}>
          <EuiResizableContainer onPanelWidthChange={onVerticalPanelWidthChange} direction="vertical" style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={verticalPanelIds.firstPanelId}
                  minSize="140px"
                  paddingSize="none"
                  scrollable={false}
                  className={styles.queryPanel}
                  initialSize={vertical[verticalPanelIds.firstPanelId] ?? 20}
                  style={{ minHeight: '140px', overflow: 'hidden' }}
                >
                  <QueryWrapper
                    query={script}
                    activeMode={activeMode}
                    resultsMode={resultsMode}
                    setQuery={setScript}
                    setQueryEl={setScriptEl}
                    setIsCodeBtnDisabled={setIsCodeBtnDisabled}
                    onSubmit={onSubmit}
                    onQueryChangeMode={onQueryChangeMode}
                    onChangeGroupMode={onChangeGroupMode}
                  />
                </EuiResizablePanel>

                <EuiResizableButton
                  className={styles.resizeButton}
                  data-test-subj="resize-btn-scripting-area-and-results"
                />

                <EuiResizablePanel
                  id={verticalPanelIds.secondPanelId}
                  minSize="60px"
                  paddingSize="none"
                  scrollable={false}
                  initialSize={vertical[verticalPanelIds.secondPanelId] ?? 80}
                  className={cx(styles.queryResults, styles.queryResultsPanel)}
                  // Fix scroll on low height - 140px (queryPanel)
                  style={{ maxHeight: 'calc(100% - 140px)' }}
                >
                  <WBResultsWrapper
                    items={items}
                    activeMode={activeMode}
                    activeResultsMode={resultsMode}
                    scrollDivRef={scrollDivRef}
                    onQueryReRun={onSubmit}
                    onQueryOpen={onQueryOpen}
                    onQueryDelete={onQueryDelete}
                  />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        </div>
      </div>
    </div>
  )
}

export default WBView
