import React from 'react'
import { instance, mock } from 'ts-mockito'
import { MOCK_ANALYSIS_REPORT_DATA } from 'uiSrc/mocks/data/analysis'
import { formatBytes, getGroupTypeDisplay } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { fireEvent, render, screen, within } from 'uiSrc/utils/test-utils'

import AnalysisDataView, { Props } from './AnalysisDataView'

const mockedProps = mock<Props>()

const mockReports = [
  {
    id: MOCK_ANALYSIS_REPORT_DATA.id,
    createdAt: '2022-09-23T05:30:23.000Z'
  },
  {
    id: 'id_2',
    createdAt: '2022-09-23T05:15:19.000Z'
  }
]

describe('AnalysisDataView', () => {
  it('should render', () => {
    expect(render(<AnalysisDataView {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render only table when loading="true"', () => {
    render(<AnalysisDataView {...instance(mockedProps)} loading />)

    expect(screen.queryByTestId('empty-analysis-no-reports')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-analysis-no-keys')).not.toBeInTheDocument()
  })

  it('should render empty-data-message-no-keys when total=0 ', () => {
    const mockedData = { totalKeys: { total: 0 } }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    expect(screen.queryByTestId('empty-analysis-no-reports')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-analysis-no-keys')).toBeInTheDocument()
  })

  it('should render empty-data-message-no-reports when reports=[] ', () => {
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={[]} />
    )

    expect(screen.queryByTestId('empty-analysis-no-reports')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-analysis-no-keys')).not.toBeInTheDocument()
  })
})

/**
 * AnalysisDataView tests
 *
 * @group component
 */
describe('AnalysisDataView', () => {
  it('should render properly extrapolated data for summary per data', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(`~${formatBytes(mockedData.totalMemory.total * 2, 3)}`)
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(`~${numberWithSpaces(mockedData.totalKeys.total * 2)}`)

    const arcItemMemory = mockedData.totalMemory.types[0]
    const donutMemory = screen.getByTestId('donut-memory')
    const arcMemory = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(`arc-${getGroupTypeDisplay(arcItemMemory.type)}-${arcItemMemory.total}`)

    fireEvent.mouseEnter(arcMemory(donutMemory))
    expect(within(donutMemory).getByTestId('chart-value-tooltip')).toHaveTextContent(`~${formatBytes(arcItemMemory.total * 2, 3)}`)
    fireEvent.mouseLeave(donutMemory)

    const arcItemkeys = mockedData.totalKeys.types[0]
    const donutKeys = screen.getByTestId('donut-keys')
    const arcKeys = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(`arc-${getGroupTypeDisplay(arcItemkeys.type)}-${arcItemkeys.total}`)
    fireEvent.mouseEnter(arcKeys(donutKeys))
    expect(within(donutKeys).getByTestId('chart-value-tooltip')).toHaveTextContent(`~${numberWithSpaces(arcItemkeys.total * 2)}`)
  })

  it('should render properly not extrapolated data for summary per data after switching off', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    fireEvent.click(within(screen.getByTestId('summary-per-data')).getByTestId('extrapolate-results'))

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(`${formatBytes(mockedData.totalMemory.total, 3)}`)
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(`${numberWithSpaces(mockedData.totalKeys.total)}`)

    const arcItemMemory = mockedData.totalMemory.types[0]
    const donutMemory = screen.getByTestId('donut-memory')
    const arcMemory = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(`arc-${getGroupTypeDisplay(arcItemMemory.type)}-${arcItemMemory.total}`)

    fireEvent.mouseEnter(arcMemory(donutMemory))
    expect(within(donutMemory).getByTestId('chart-value-tooltip')).toHaveTextContent(`${formatBytes(arcItemMemory.total, 3)}`)
    fireEvent.mouseLeave(donutMemory)

    const arcItemkeys = mockedData.totalKeys.types[0]
    const donutKeys = screen.getByTestId('donut-keys')
    const arcKeys = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(`arc-${getGroupTypeDisplay(arcItemkeys.type)}-${arcItemkeys.total}`)
    fireEvent.mouseEnter(arcKeys(donutKeys))
    expect(within(donutKeys).getByTestId('chart-value-tooltip')).toHaveTextContent(`${numberWithSpaces(arcItemkeys.total)}`)
  })

  it('should render properly extrapolated data for ttl chart', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(screen.getByTestId(`circle-${expirationGroup.threshold}-${expirationGroup.total * 2}`))
    expect(screen.getByTestId('area-tooltip-circle')).toHaveTextContent(`~${formatBytes(expirationGroup.total * 2, 3)}`)
  })

  it('should render properly not extrapolated data for ttl chart after switching off', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )
    fireEvent.click(within(screen.getByTestId('analysis-ttl')).getByTestId('extrapolate-results'))

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(screen.getByTestId(`circle-${expirationGroup.threshold}-${expirationGroup.total}`))
    expect(screen.getByTestId('area-tooltip-circle')).toHaveTextContent(`${formatBytes(expirationGroup.total, 3)}`)
  })

  it('should render properly extrapolated data for top namespaces table', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`))
      .toHaveTextContent(`~${formatBytes(nspTopKeyItem.memory * 2, 3, true)[0]}`)

    expect(screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0])
      .toHaveTextContent(`~${numberWithSpaces(nspTopKeyItem.keys * 2)}`)
  })

  it('should render properly not extrapolated data for top namespaces table after switching off', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )
    fireEvent.click(within(screen.getByTestId('top-namespaces')).getByTestId('extrapolate-results'))

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`))
      .toHaveTextContent(`${formatBytes(nspTopKeyItem.memory, 3, true)[0]}`)

    expect(screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0])
      .toHaveTextContent(`${numberWithSpaces(nspTopKeyItem.keys)}`)
  })

  it('should not render extrapolation switcher and extrapolated data for full scanned db', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 10000,
        processed: 80
      }
    }
    render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockedData} />
    )

    expect(screen.queryByTestId('extrapolate-results')).not.toBeInTheDocument()

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(`${formatBytes(mockedData.totalMemory.total, 3)}`)
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(`${numberWithSpaces(mockedData.totalKeys.total)}`)

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(screen.getByTestId(`circle-${expirationGroup.threshold}-${expirationGroup.total}`))
    expect(screen.getByTestId('area-tooltip-circle')).toHaveTextContent(`${formatBytes(expirationGroup.total, 3)}`)

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`))
      .toHaveTextContent(`${formatBytes(nspTopKeyItem.memory, 3, true)[0]}`)

    expect(screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0])
      .toHaveTextContent(`${numberWithSpaces(nspTopKeyItem.keys)}`)
  })
})
