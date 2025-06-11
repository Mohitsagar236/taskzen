import React from 'react';
import { useParams } from 'react-router-dom';
import TaskList from '../components/TaskList';

const CategoryTasks: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  if (!category) {
    return <div>Category not found</div>;
  }
  
  return (
    <div className="p-6">
      <TaskList category={category} />
    </div>
  );
};

export default CategoryTasks;