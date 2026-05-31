import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';

describe('TaskForm Component', () => {
  const mockOnCreateTask = jest.fn();
  const mockTags = [
    { _id: '1', name: 'Work' },
    { _id: '2', name: 'Personal' },
    { _id: '3', name: 'Urgent' }
  ];

  beforeEach(() => {
    mockOnCreateTask.mockClear();
  });

  test('renders form with all input fields', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  test('displays validation error when title is empty', async () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockOnCreateTask).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    mockOnCreateTask.mockResolvedValue({ success: true });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'High',
        tags: []
      });
    });
  });

  test('clears form after successful submission', async () => {
    mockOnCreateTask.mockResolvedValue({ success: true });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });
  });

  test('displays error message when API call fails', async () => {
    mockOnCreateTask.mockResolvedValue({ 
      success: false, 
      error: 'Failed to create task' 
    });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });

  test('includes due date when provided', async () => {
    mockOnCreateTask.mockResolvedValue({ success: true });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          dueDate: '2024-12-31'
        })
      );
    });
  });

  test('handles multiple tag selection', async () => {
    mockOnCreateTask.mockResolvedValue({ success: true });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const tagsSelect = screen.getByLabelText(/tags/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    // Get the options and mark them as selected
    const workOption = screen.getByRole('option', { name: 'Work' });
    const urgentOption = screen.getByRole('option', { name: 'Urgent' });
    
    workOption.selected = true;
    urgentOption.selected = true;
    
    // Trigger change event
    fireEvent.change(tagsSelect);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.arrayContaining(['Work', 'Urgent'])
        })
      );
    });
  });

  test('trims whitespace from title and description', async () => {
    mockOnCreateTask.mockResolvedValue({ success: true });

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
    fireEvent.change(descriptionInput, { target: { value: '  Test Description  ' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'Test Description'
        })
      );
    });
  });

  test('disables submit button while submitting', async () => {
    mockOnCreateTask.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).not.toBeDisabled();
    });
  });

  test('default priority is Medium', () => {
    render(<TaskForm onCreateTask={mockOnCreateTask} availableTags={mockTags} />);

    const prioritySelect = screen.getByLabelText(/priority/i);
    expect(prioritySelect.value).toBe('Medium');
  });
});
