import React, { useState, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuid } from 'uuid';

function Column({ id, title, tasks, setColumnTasks }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const handleAddTask = (event) => {
    event.preventDefault();
    const newTaskName = event.target.elements.taskName.value;
    if (newTaskName.trim() !== '') {
      const newTask = {
        id: uuid(),
        name: newTaskName,
      };
      setColumnTasks([...tasks, newTask]);
      event.target.reset();
    }
  };

  const renderTasks = () => {
    return tasks.map((task) => (
      <Task key={task.id} id={task.id} name={task.name} />
    ));
  };

  return (
    <div ref={setNodeRef} className="column">
      <h2>{title}</h2>
      {renderTasks()}
      <NewTaskForm onAddTask={handleAddTask} />
    </div>
  );
}

function Task({ id, name }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="task">
      {name}
    </div>
  );
}

function NewTaskForm({ onAddTask }) {
  return (
    <form className="new-task-form" onSubmit={onAddTask}>
      <input type="text" name="taskName" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  );
}

function App() {
  const [columns, setColumns] = useState({
    'column1': {
      id: 'column1',
      title: 'To Do',
      tasks: [
        { id: uuid(), name: 'Learn React' },
        { id: uuid(), name: 'Build Kanban Board' },
      ],
    },
    'column2': {
      id: 'column2',
      title: 'In Progress',
      tasks: [{ id: uuid(), name: 'Implement Drag and Drop' }],
    },
    'column3': {
      id: 'column3',
      title: 'Done',
      tasks: [{ id: uuid(), name: 'Set up Vite' }],
    },
  });

  const setColumnTasks = useCallback((columnId, newTasks) => {
    setColumns(prevColumns => ({
      ...prevColumns,
      [columnId]: { ...prevColumns[columnId], tasks: newTasks },
    }));
  }, []);

  const handleDragEnd = (event) => {
    const { over, active } = event;

    if (over && active.id !== over.id) {
      const activeColumnId = Object.keys(columns).find(columnId =>
        columns[columnId].tasks.find(task => task.id === active.id)
      );
      const overColumnId = over.id;

      if (activeColumnId && overColumnId) {
        if (activeColumnId === overColumnId) return;

        setColumns(prevColumns => {
          const activeTask = prevColumns[activeColumnId].tasks.find(task => task.id === active.id);

          const newActiveColumnTasks = prevColumns[activeColumnId].tasks.filter(task => task.id !== active.id);
          const newOverColumnTasks = [...prevColumns[overColumnId].tasks, activeTask];

          return {
            ...prevColumns,
            [activeColumnId]: {
              ...prevColumns[activeColumnId],
              tasks: newActiveColumnTasks,
            },
            [overColumnId]: {
              ...prevColumns[overColumnId],
              tasks: newOverColumnTasks,
            },
          };
        });
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {Object.values(columns).map((column) => (
        <Column
          key={column.id}
          id={column.id}
          title={column.title}
          tasks={column.tasks}
          setColumnTasks={(newTasks) => setColumnTasks(column.id, newTasks)}
        />
      ))}
    </DndContext>
  );
}

export default App;
