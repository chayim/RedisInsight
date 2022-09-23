import React from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiButton,
  EuiText
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { appContextBrowserTree } from 'uiSrc/slices/app/context'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximateNumber } from 'uiSrc/utils/validations'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export const getFormatTime = (time: string = '') =>
  format(new Date(time), 'd MMM yyyy HH:mm')

export interface Props {
  reports: any[]
  selectedValue: Nullable<string>
  progress: any
  analysisLoading: boolean
  onChangeSelectedAnalysis: (value: string) => void
}

const Header = (props: Props) => {
  const {
    reports = [],
    selectedValue,
    onChangeSelectedAnalysis,
    progress = null,
    analysisLoading
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { delimiter } = useSelector(appContextBrowserTree)

  const analysisOptions: EuiSuperSelectOption<any>[] = reports.map((item) => {
    const { createdAt, id } = item
    return {
      value: id,
      inputDisplay: (
        <span>{getFormatTime(createdAt)}</span>
      ),
      'data-test-subj': `reports-report-${id}`,
    }
  })

  return (
    <div data-testid="db-reports-header">
      <AnalyticsTabs />
      <EuiFlexGroup className={styles.container} gutterSize="none" alignItems="center" justifyContent="spaceBetween">
        {reports.length ? (
          <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiText color="subdued">Report generated on:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSuperSelect
                options={analysisOptions}
                style={{ border: 'none !important' }}
                className={styles.changeReport}
                popoverClassName={styles.changeReport}
                valueOfSelected={selectedValue ?? ''}
                onChange={(value: string) => onChangeSelectedAnalysis(value)}
                data-testid="select-view-type"
              />
            </EuiFlexItem>
            {!!progress && (
              <EuiFlexItem grow={false}>
                <EuiText color="subdued" className={cx(styles.progress, styles.progressContainer)} data-testid="bulk-delete-summary">
                  <EuiText
                    color={progress.total === progress.processed ? 'subdued' : 'warning'}
                    className={styles.progress}
                    data-testid="bulk-delete-summary"
                  >
                    {`Scanned ${getApproximateNumber((
                      progress.total
                        ? progress.processed / progress.total
                        : 1
                    ) * 100)}%`}
                  </EuiText>
                  {` (${numberWithSpaces(progress.processed)}/${numberWithSpaces(progress.total)} keys)`}
                </EuiText>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <div />
        )}
        <div>
          <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
            <EuiFlexItem style={{ overflow: 'hidden' }}>
              <EuiButton
                aria-label="New reports"
                fill
                data-testid="enablement-area__next-page-btn"
                color="secondary"
                iconType="playFilled"
                iconSide="left"
                disabled={analysisLoading}
                onClick={() => dispatch(createNewAnalysis(instanceId, delimiter))}
                size="s"
              >
                New reports
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem style={{ paddingLeft: 12 }} grow={false}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Memory Efficiency"
                content="Analyze up to 10K keys in your Redis database to get an overview of your data and memory efficiency recommendations."
              >
                <EuiIcon
                  className={styles.infoIcon}
                  type="iInCircle"
                  size="l"
                  data-testid="db-new-reports-icon"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </EuiFlexGroup>
    </div>
  )
}

export default Header
