import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const path = req.query.path as string[];
  const apiPath = path ? path.join('/') : '';

  try {
    // Project Groups endpoints
    if (apiPath === 'project-groups') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('project_groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const { data, error } = await supabase
          .from('project_groups')
          .insert(toSnakeCase(req.body))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Project Group by ID
    if (apiPath.startsWith('project-groups/') && apiPath.split('/').length === 2) {
      const id = apiPath.split('/')[1];

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('project_groups')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'PUT') {
        const { data, error } = await supabase
          .from('project_groups')
          .update(toSnakeCase(req.body))
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('project_groups')
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(204).end();
      }
    }

    // Projects endpoints
    if (apiPath === 'projects') {
      if (req.method === 'GET') {
        let query = supabase.from('projects').select('*');

        if (req.query.groupId) {
          query = query.eq('group_id', req.query.groupId as string);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const { data, error } = await supabase
          .from('projects')
          .insert(toSnakeCase(req.body))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Project by ID
    if (apiPath.startsWith('projects/') && apiPath.split('/').length === 2) {
      const id = apiPath.split('/')[1];

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'PUT') {
        const { data, error } = await supabase
          .from('projects')
          .update(toSnakeCase(req.body))
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(204).end();
      }
    }

    // Tasks endpoints
    if (apiPath === 'tasks') {
      if (req.method === 'GET') {
        let query = supabase.from('tasks').select('*');

        if (req.query.projectId) {
          query = query.eq('project_id', req.query.projectId as string);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const { data, error } = await supabase
          .from('tasks')
          .insert(toSnakeCase(req.body))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Task by ID
    if (apiPath.startsWith('tasks/') && apiPath.split('/').length === 2) {
      const id = apiPath.split('/')[1];

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'PUT') {
        const updateData = {
          ...req.body,
          updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('tasks')
          .update(toSnakeCase(updateData))
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(204).end();
      }
    }

    // Subtasks endpoints
    if (apiPath.match(/^tasks\/[^\/]+\/subtasks$/)) {
      const taskId = apiPath.split('/')[1];

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('subtasks')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const subtaskData = {
          ...req.body,
          taskId
        };

        const { data, error } = await supabase
          .from('subtasks')
          .insert(toSnakeCase(subtaskData))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Subtask by ID
    if (apiPath.startsWith('subtasks/') && apiPath.split('/').length === 2) {
      const id = apiPath.split('/')[1];

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('subtasks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'PUT') {
        const updateData = {
          ...req.body,
          updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('subtasks')
          .update(toSnakeCase(updateData))
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(200).json(toCamelCase(data));
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('subtasks')
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ message: 'Not found' });
          throw error;
        }
        return res.status(204).end();
      }
    }

    // Tags endpoints
    if (apiPath === 'tags') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const { data, error } = await supabase
          .from('tags')
          .insert(toSnakeCase(req.body))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Milestones endpoints
    if (apiPath === 'milestones') {
      if (req.method === 'GET') {
        let query = supabase.from('milestones').select('*');

        if (req.query.projectId) {
          query = query.eq('project_id', req.query.projectId as string);
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) throw error;
        return res.status(200).json(toCamelCase(data || []));
      }

      if (req.method === 'POST') {
        const { data, error } = await supabase
          .from('milestones')
          .insert(toSnakeCase(req.body))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCamelCase(data));
      }
    }

    // Search endpoints
    if (apiPath === 'search/tasks') {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter required' });
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(toCamelCase(data || []));
    }

    if (apiPath === 'search/projects') {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter required' });
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(toCamelCase(data || []));
    }

    // If no route matched
    res.status(404).json({ message: `API route not found: ${apiPath}` });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}