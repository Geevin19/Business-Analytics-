import { Router, Response } from 'express'
import multer, { MulterError } from 'multer'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import {
  processUpload,
  getAllDatasets,
  getDatasetById,
  deleteDataset,
  clearAllDatasets,
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
  return 'text'
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

      const id = generateId()
      const fileName = file.originalname
      const fileType = getFileType(fileName)
      const content = file.buffer.toString('utf-8')

      const result = processUpload(id, fileName, fileType, content)
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

    const id = generateId()
    const name = fileName || `data_${id.slice(0, 8)}`
    const type = fileType || 'json'

    const result = processUpload(id, name, type, content)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Upload failed' })
  }
})

router.get('/datasets', authenticate, async (_req: AuthRequest, res: Response) => {
  res.json(getAllDatasets())
})

router.get('/datasets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const dataset = getDatasetById(req.params.id)
  if (!dataset) {
    return res.status(404).json({ message: 'Dataset not found' })
  }
  res.json(dataset)
})

router.delete('/datasets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const deleted = deleteDataset(req.params.id)
  if (!deleted) {
    return res.status(404).json({ message: 'Dataset not found' })
  }
  res.json({ message: 'Dataset deleted' })
})

router.delete('/datasets', authenticate, async (_req: AuthRequest, res: Response) => {
  clearAllDatasets()
  res.json({ message: 'All datasets cleared' })
})

export default router