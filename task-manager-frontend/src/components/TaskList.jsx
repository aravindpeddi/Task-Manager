import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [timeRemaining, setTimeRemaining] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5143/api/task');
            setTasks(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch tasks. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetAllTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // First get current tasks to ensure we have latest data
            const { data: currentTasks } = await axios.get('http://localhost:5143/api/task');
            
            await Promise.all(
                currentTasks.map(task =>
                    axios.put(`http://localhost:5143/api/task/${task.id}`, {
                        ...task,
                        isCompleted: false
                    })
                )
            );
            await fetchTasks();
        } catch (err) {
            console.error("Error resetting tasks:", err);
            setError("Failed to reset tasks. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchTasks]);

    useEffect(() => {
        fetchTasks();
        updateCountdown();

        const countdownInterval = setInterval(updateCountdown, 1000);

        const now = new Date();
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = nextMidnight - now;

        const timer = setTimeout(() => {
            resetAllTasks();
            setInterval(resetAllTasks, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(timer);
        };
    }, [fetchTasks, resetAllTasks]);

    const addTask = async () => {
        if (!newTask.trim()) {
            setError("Task title cannot be empty");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5143/api/task', {
                title: newTask,
                description: newDescription,
                isCompleted: false
            });
            setTasks(prev => [...prev, response.data]);
            setNewTask("");
            setNewDescription("");
        } catch (err) {
            console.error(err);
            setError("Failed to add task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const markAsDone = async (task) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`http://localhost:5143/api/task/${task.id}`, {
                ...task,
                isCompleted: true
            });
            await fetchTasks();
        } catch (err) {
            console.error("Error marking task as done:", err);
            setError("Failed to update task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetTask = async (task) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`http://localhost:5143/api/task/${task.id}`, {
                ...task,
                isCompleted: false
            });
            await fetchTasks();
        } catch (err) {
            console.error("Error resetting task:", err);
            setError("Failed to reset task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (taskId) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`http://localhost:5143/api/task/${taskId}`);
            await fetchTasks();
        } catch (err) {
            console.error("Error deleting task:", err);
            setError("Failed to delete task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAllTasks = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete all tasks?");
        if (!confirmDelete) return;

        setIsLoading(true);
        setError(null);
        try {
            await Promise.all(
                tasks.map(task =>
                    axios.delete(`http://localhost:5143/api/task/${task.id}`)
                )
            );
            setTasks([]);
        } catch (err) {
            console.error("Error deleting tasks:", err);
            setError("Failed to delete tasks. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description);
    };

    const saveEdit = async (task) => {
        if (!editTitle.trim()) {
            setError("Task title cannot be empty");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`http://localhost:5143/api/task/${task.id}`, {
                ...task,
                title: editTitle,
                description: editDescription
            });
            setEditingTaskId(null);
            await fetchTasks();
        } catch (err) {
            console.error("Error saving task:", err);
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
    };

    const updateCountdown = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };

    const incompleteTasks = useMemo(() => tasks.filter(task => !task.isCompleted), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(task => task.isCompleted), [tasks]);

    return (
        <div style={{
            minHeight: "100vh",
            width: "100vw",
            backgroundColor: "#f9fafb",
            padding: "40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "black"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "1400px",
                background: "#ffffff",
                padding: "30px",
                borderRadius: "16px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                color: "black"
            }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>🗂️ Task Manager</h1>
                <h3 style={{ textAlign: "center", marginBottom: "30px", color: "black" }}>
                    ⏳ Time remaining to reset tasks: <strong>{timeRemaining}</strong>
                </h3>

                {error && (
                    <div style={{
                        padding: "10px",
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        borderRadius: "6px",
                        marginBottom: "20px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: "30px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                    <input
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Task title"
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid black",      // changed border to black
                            width: "180px",
                            color: "black",
                            backgroundColor: "white"        // added white background
                        }}
                        disabled={isLoading}
                    />
                    <input
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Task description"
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid black",      // changed border to black
                            width: "200px",
                            color: "black",
                            backgroundColor: "white"        // added white background
                        }}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={addTask} 
                        style={{ padding: "10px 16px", borderRadius: "6px", background: "#dbeafe", color: "black", border: "1px solid #93c5fd" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Task"}
                    </button>
                    <button 
                        onClick={resetAllTasks} 
                        style={{ padding: "10px 16px", borderRadius: "6px", background: "#fef9c3", color: "black", border: "1px solid #fde68a" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Reset All"}
                    </button>
                    <button 
                        onClick={deleteAllTasks} 
                        style={{ padding: "10px 16px", borderRadius: "6px", background: "#fee2e2", color: "black", border: "1px solid #fca5a5" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete All"}
                    </button>
                </div>

                {isLoading && !tasks.length ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>Loading tasks...</div>
                ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap", color: "black" }}>
                        <div style={{ flex: "1", minWidth: "300px" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>🕑 Tasks yet to Complete</h2>
                            {incompleteTasks.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No incomplete tasks</div>
                            ) : (
                                incompleteTasks.map(task => (
                                    <div key={task.id} style={{ background: "#f3f4f6", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                                        {editingTaskId === task.id ? (
                                            <>
                                                <input 
                                                    value={editTitle} 
                                                    onChange={(e) => setEditTitle(e.target.value)} 
                                                    style={{ width: "100%", marginBottom: "5px", color: "black" }} 
                                                    disabled={isLoading}
                                                />
                                                <textarea 
                                                    value={editDescription} 
                                                    onChange={(e) => setEditDescription(e.target.value)} 
                                                    style={{ width: "100%", color: "black" }} 
                                                    disabled={isLoading}
                                                />
                                                <button 
                                                    onClick={() => saveEdit(task)} 
                                                    style={{ marginTop: "5px", marginRight: "5px", color: "black" }}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Saving..." : "Save"}
                                                </button>
                                                <button 
                                                    onClick={cancelEdit} 
                                                    style={{ color: "black" }}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{task.title}</div>
                                                <div style={{ marginBottom: "10px" }}>{task.description}</div>
                                                <button 
                                                    onClick={() => markAsDone(task)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#bbf7d0", color: "black", border: "1px solid #86efac", marginRight: "5px" }}
                                                    disabled={isLoading}
                                                >
                                                    Mark as Done
                                                </button>
                                                <button 
                                                    onClick={() => startEditing(task)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#bfdbfe", color: "black", border: "1px solid #93c5fd", marginRight: "5px" }}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteTask(task.id)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#fecaca", color: "black", border: "1px solid #f87171" }}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ flex: "1", minWidth: "300px" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>✅ Completed Tasks</h2>
                            {completedTasks.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No completed tasks</div>
                            ) : (
                                completedTasks.map(task => (
                                    <div key={task.id} style={{ background: "#e0f2fe", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                                        {editingTaskId === task.id ? (
                                            <>
                                                <input 
                                                    value={editTitle} 
                                                    onChange={(e) => setEditTitle(e.target.value)} 
                                                    style={{ width: "100%", marginBottom: "5px", color: "black" }} 
                                                    disabled={isLoading}
                                                />
                                                <textarea 
                                                    value={editDescription} 
                                                    onChange={(e) => setEditDescription(e.target.value)} 
                                                    style={{ width: "100%", color: "black" }} 
                                                    disabled={isLoading}
                                                />
                                                <button 
                                                    onClick={() => saveEdit(task)} 
                                                    style={{ marginTop: "5px", marginRight: "5px", color: "black" }}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Saving..." : "Save"}
                                                </button>
                                                <button 
                                                    onClick={cancelEdit} 
                                                    style={{ color: "black" }}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{task.title}</div>
                                                <div style={{ marginBottom: "10px" }}>{task.description}</div>
                                                <button 
                                                    onClick={() => resetTask(task)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#fef08a", color: "black", border: "1px solid #facc15", marginRight: "5px" }}
                                                    disabled={isLoading}
                                                >
                                                    Reset
                                                </button>
                                                <button 
                                                    onClick={() => startEditing(task)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#bfdbfe", color: "black", border: "1px solid #93c5fd", marginRight: "5px" }}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteTask(task.id)} 
                                                    style={{ padding: "5px 10px", borderRadius: "6px", background: "#fecaca", color: "black", border: "1px solid #f87171" }}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskList;