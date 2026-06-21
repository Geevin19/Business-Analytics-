import { Router, Response } from 'express'
import multer from 'multer'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import {
  processUpload,
  getAllDatasets,
  getDatasetById,
  deleteDataset,
  clearAllDatasets,
  appendToDataset,
  getAnalysisByLocation,
  UploadedData,
} from '../services/trend.service'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function generateId(): string {
  return `ds_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['csv'].includes(ext)) return 'csv'
  if (['json'].includes(ext)) return 'json'
  if (['txt', 'tsv', 'tab'].includes(ext)) return 'text'
  if (['xlsx', 'xls'].includes(ext)) return 'xlsx'
  return 'text'
}

function getUserId(req: AuthRequest): string {
  return req.user?.id || 'anonymous'
}

router.post('/upload', authenticate, (req: AuthRequest, res: Response) => {
  try {
    upload.single('file')(req as any, res as any, (err: any) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        return res.status(400).json({ message })
      }

      const file = (req as any).file
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      const userId = getUserId(req)
      const id = generateId()
      const fileName = file.originalname
      const fileType = getFileType(fileName)
      const isExcel = fileType === 'xlsx' || fileType === 'xls'
      const content = isExcel ? '' : file.buffer.toString('utf-8')
      const buffer = isExcel ? file.buffer : undefined
      const schedule = (req.query.schedule as string) || (req.body.schedule as string) || 'none'

      const result = processUpload(userId, id, fileName, fileType, content, buffer, schedule)
      res.json(result)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    res.status(500).json({ message })
  }
})

router.post('/upload-data', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType, content, schedule, appendTo } = req.body

    if (!content) {
      return res.status(400).json({ message: 'No content provided' })
    }

    const userId = getUserId(req)

    // If appending to an existing dataset
    if (appendTo) {
      const updated = appendToDataset(userId, appendTo, content, fileType || 'json')
      if (!updated) {
        return res.status(404).json({ message: 'Dataset not found' })
      }
      return res.json(updated)
    }

    const id = generateId()
    const name = fileName || `data_${id.slice(0, 8)}`
    const type = fileType || 'json'
    const sched = schedule || 'none'

    const result = processUpload(userId, id, name, type, content, undefined, sched)
    res.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    res.status(500).json({ message })
  }
})

router.get('/datasets', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  res.json(getAllDatasets(userId))
})

router.get('/datasets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  const dataset = getDatasetById(userId, req.params.id)
  if (!dataset) {
    return res.status(404).json({ message: 'Dataset not found' })
  }
  res.json(dataset)
})

/**
 * Get analysis filtered by location
 * GET /trend/datasets/:id/location/:locationName
 */
router.get('/datasets/:id/location/:locationName', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  const analysis = getAnalysisByLocation(userId, req.params.id, req.params.locationName)
  if (!analysis) {
    return res.status(404).json({ message: 'No data found for this location' })
  }
  res.json(analysis)
})

/**
 * Append data to a scheduled dataset
 * POST /trend/datasets/:id/append
 */
router.post('/datasets/:id/append', authenticate, (req: AuthRequest, res: Response) => {
  try {
    upload.single('file')(req as any, res as any, (err: any) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        return res.status(400).json({ message })
      }

      const file = (req as any).file
      const userId = getUserId(req)

      let content = ''
      let fileType = 'json'
      let buffer: Buffer | undefined

      if (file) {
        const fileName = file.originalname
        fileType = getFileType(fileName)
        const isExcel = fileType === 'xlsx' || fileType === 'xls'
        content = isExcel ? '' : file.buffer.toString('utf-8')
        buffer = isExcel ? file.buffer : undefined
      } else {
        content = req.body.content
        fileType = req.body.fileType || 'json'
      }

      if (!content && !buffer) {
        return res.status(400).json({ message: 'No content provided' })
      }

      const updated = appendToDataset(userId, req.params.id, content, fileType, buffer)
      if (!updated) {
        return res.status(404).json({ message: 'Dataset not found' })
      }
      res.json(updated)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Append failed'
    res.status(500).json({ message })
  }
})

/**
 * Update schedule for a dataset
 * PUT /trend/datasets/:id/schedule
 */
router.put('/datasets/:id/schedule', authenticate, (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  const datasets = getAllDatasets(userId)
  const dataset = datasets.find(d => d.id === req.params.id)
  if (!dataset) {
    return res.status(404).json({ message: 'Dataset not found' })
  }
  dataset.schedule = req.body.schedule || 'none'
  dataset.lastScheduledUpdate = new Date().toISOString()
  res.json(dataset)
})

router.delete('/datasets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  const deleted = deleteDataset(userId, req.params.id)
  if (!deleted) {
    return res.status(404).json({ message: 'Dataset not found' })
  }
  res.json({ message: 'Dataset deleted' })
})

router.delete('/datasets', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  clearAllDatasets(userId)
  res.json({ message: 'All datasets cleared' })
})

// Get all analyzed columns (for sidebar) - filtered by current user
router.get('/analyzed-columns', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req)
  const datasets = getAllDatasets(userId)
  const columns: {
    id: string
    datasetId: string
    datasetName: string
    columnName: string
    trend: string
    trendPercentage: number
    mean: number
    min: number
    max: number
  }[] = []

  datasets.forEach(ds => {
    ds.numericColumns.forEach(col => {
      const analysis = ds.analysis[col]
      if (analysis) {
        columns.push({
          id: `${ds.id}_${col}`,
          datasetId: ds.id,
          datasetName: ds.fileName,
          columnName: col,
          trend: analysis.trend,
          trendPercentage: analysis.trendPercentage,
          mean: analysis.mean,
          min: analysis.min,
          max: analysis.max,
        })
      }
    })
  })

  res.json(columns)
})

export default router