import { Request, Response, NextFunction } from 'express';
import { CrudService } from '../services/crud.service';

export class CrudController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await CrudService.findAll(req.params.collection, req.query);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await CrudService.findById(req.params.collection, Number(req.params.id));
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await CrudService.create(req.params.collection, req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await CrudService.update(req.params.collection, Number(req.params.id), req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await CrudService.delete(req.params.collection, Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}
