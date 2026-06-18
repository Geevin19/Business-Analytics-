import { Router, Response } from 'express'
import multer from 'multer'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import {
  processUpload,
  getAllDatasets,
  getDatasetById,
  deleteDataset,
  clearAllDatasets,
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
        return res.status(400).json({ message: err.message || 'Upload failed' })
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

      const result = processUpload(userId, id, fileName, fileType, content, buffer)
      res.json(result)
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Upload failed' })
  }
})

router.post('/upload-data', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType, content } = req.body

    if (!content) {
      return res.status(400).json({ message: 'No content provided' })
    }

    const userId = getUserId(req)
    const id = generateId()
    const name = fileName || `data_${id.slice(0, 8)}`
    const type = fileType || 'json'

    const result = processUpload(userId, id, name, type, content)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Upload failed' })
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