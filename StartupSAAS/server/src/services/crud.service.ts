import { Model, Op } from 'sequelize';
import { modelRegistry } from '../models';
import fs from 'fs';
import path from 'path';

export class CrudService {
  static getModel(collection: string): typeof Model {
    const model = modelRegistry[collection];
    if (!model) throw new Error(`Collection not found: ${collection}`);
    return model;
  }

  private static processBase64Avatar(data: any, id: number) {
    if (data && typeof data.avatar === 'string' && data.avatar.startsWith('data:image/')) {
      const matches = data.avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1] || 'jpg';
        const base64Data = matches[2];
        const filename = `avatar_${id}_${Date.now()}.${ext}`;
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(base64Data, 'base64'));
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        data.avatar = `${backendUrl}/uploads/${filename}`;
      }
    }
  }

  static async findAll(collection: string, query: Record<string, any>) {
    const ModelClass = this.getModel(collection);
    const filters = { ...query };
    const sort = filters._sort as string;
    const order = (filters._order as string) || 'ASC';

    delete filters._sort;
    delete filters._order;
    delete filters._page;
    delete filters._limit;

    const whereClause: any = {};

    for (const key of Object.keys(filters)) {
      const value = filters[key];
      if (key.endsWith(':contains')) {
        whereClause[key.replace(':contains', '')] = { [Op.iLike]: `%${value}%` };
      } else if (value === 'true') {
        whereClause[key] = true;
      } else if (value === 'false') {
        whereClause[key] = false;
      } else {
        whereClause[key] = value;
      }
    }

    const options: any = { where: whereClause };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    return await ModelClass.findAll(options);
  }

  static async findById(collection: string, id: number) {
    const ModelClass = this.getModel(collection);
    const item = await ModelClass.findByPk(id);
    if (!item) throw new Error('Item not found');
    return item;
  }

  static async create(collection: string, data: any) {
    const ModelClass = this.getModel(collection);
    
    if (data.id === undefined || data.id === null) {
      const items = await ModelClass.findAll({ attributes: ['id'] });
      const numericIds = items.map((i: any) => parseInt(i.id, 10)).filter(id => !isNaN(id));
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 10000;
      data.id = maxId + 1;
    } else {
      data.id = Number(data.id);
    }

    if (collection === 'users') {
      this.processBase64Avatar(data, data.id);
    }

    return await ModelClass.create(data);
  }

  static async update(collection: string, id: number, data: any) {
    const ModelClass = this.getModel(collection);
    const item = await ModelClass.findByPk(id);
    if (!item) throw new Error('Item not found');

    if (collection === 'users') {
      this.processBase64Avatar(data, id);
    }

    await item.update(data);
    return item;
  }

  static async delete(collection: string, id: number) {
    const ModelClass = this.getModel(collection);
    const item = await ModelClass.findByPk(id);
    if (!item) throw new Error('Item not found');
    await item.destroy();
  }
}
