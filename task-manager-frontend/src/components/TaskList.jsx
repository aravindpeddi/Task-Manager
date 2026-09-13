import React, {
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';

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

    // -----------------------------------------
    // Backend API URL
    // -----------------------------------------
    const API_URL = import.meta.env.VITE_API_URL;

    // -----------------------------------------
    // GET ALL TASKS
    // -----------------------------------------
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_URL}/task`
            );

            setTasks(response.data);
        } catch (err) {
            console.error(
                "Error fetching tasks:",
                err
            );

            setError(
                "Failed to fetch tasks. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    // -----------------------------------------
    // RESET ALL TASKS
    // -----------------------------------------
    const resetAllTasks = useCallback(async () => {
        try {
            console.log(
                "Resetting all daily tasks..."
            );

            // One backend request resets all
            // completed tasks.
            await axios.put(
                `${API_URL}/task/reset-all`
            );

            console.log(
                "Daily tasks reset successfully."
            );

            // Get the updated task list
            await fetchTasks();

        } catch (err) {
            console.error(
                "Error resetting tasks:",
                err
            );

            setError(
                "Failed to reset tasks. Please try again."
            );
        }
    }, [API_URL, fetchTasks]);

    // -----------------------------------------
    // UPDATE COUNTDOWN
    // -----------------------------------------
    const updateCountdown = useCallback(() => {
        const now = new Date();

        // Calculate the next midnight
        const nextMidnight = new Date(now);

        nextMidnight.setHours(
            24,
            0,
            0,
            0
        );

        const diff = Math.max(
            0,
            nextMidnight.getTime() -
            now.getTime()
        );

        const hours = Math.floor(
            diff / (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (diff % (1000 * 60 * 60)) /
            (1000 * 60)
        );

        const seconds = Math.floor(
            (diff % (1000 * 60)) /
            1000
        );

        setTimeRemaining(
            `${hours
                .toString()
                .padStart(2, "0")}h ` +

            `${minutes
                .toString()
                .padStart(2, "0")}m ` +

            `${seconds
                .toString()
                .padStart(2, "0")}s`
        );
    }, []);

    // -----------------------------------------
    // INITIAL LOAD + MIDNIGHT RESET
    // -----------------------------------------
    useEffect(() => {
        let midnightTimer = null;

        let resetInProgress = false;

        // -----------------------------------------
        // Schedule the next midnight reset
        // -----------------------------------------
        const scheduleNextMidnightReset = () => {
            const now = new Date();

            const nextMidnight = new Date(now);

            nextMidnight.setHours(
                24,
                0,
                0,
                0
            );

            const msUntilMidnight = Math.max(
                0,
                nextMidnight.getTime() -
                now.getTime()
            );

            console.log(
                "Next frontend reset in:",
                msUntilMidnight,
                "ms"
            );

            midnightTimer = setTimeout(
                async () => {
                    if (!resetInProgress) {
                        resetInProgress = true;

                        try {
                            await resetAllTasks();
                        } finally {
                            resetInProgress = false;
                        }
                    }

                    // Update countdown immediately
                    // after the reset.
                    updateCountdown();

                    // Schedule the next midnight.
                    scheduleNextMidnightReset();
                },
                msUntilMidnight
            );
        };

        // -----------------------------------------
        // Initial task load
        // -----------------------------------------
        fetchTasks();

        // -----------------------------------------
        // Initial countdown
        // -----------------------------------------
        updateCountdown();

        // -----------------------------------------
        // Update countdown every second
        // -----------------------------------------
        const countdownInterval = setInterval(
            updateCountdown,
            1000
        );

        // -----------------------------------------
        // Schedule midnight reset
        // -----------------------------------------
        scheduleNextMidnightReset();

        // -----------------------------------------
        // Cleanup
        // -----------------------------------------
        return () => {
            clearInterval(
                countdownInterval
            );

            if (midnightTimer) {
                clearTimeout(
                    midnightTimer
                );
            }
        };

    }, [
        fetchTasks,
        resetAllTasks,
        updateCountdown
    ]);

    // -----------------------------------------
    // ADD TASK
    // -----------------------------------------
    const addTask = async () => {
        if (!newTask.trim()) {
            setError(
                "Task title cannot be empty"
            );

            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API_URL}/task`,
                {
                    title: newTask,
                    description: newDescription,
                    isCompleted: false
                }
            );

            setTasks(prev => [
                ...prev,
                response.data
            ]);

            setNewTask("");
            setNewDescription("");

        } catch (err) {
            console.error(
                "Error adding task:",
                err
            );

            setError(
                "Failed to add task. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // MARK TASK AS DONE
    // -----------------------------------------
    const markAsDone = async (task) => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.put(
                `${API_URL}/task/${task.id}`,
                {
                    ...task,
                    isCompleted: true
                }
            );

            await fetchTasks();

        } catch (err) {
            console.error(
                "Error marking task as done:",
                err
            );

            setError(
                "Failed to update task. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // RESET INDIVIDUAL TASK
    // -----------------------------------------
    const resetTask = async (task) => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.put(
                `${API_URL}/task/${task.id}`,
                {
                    ...task,
                    isCompleted: false
                }
            );

            await fetchTasks();

        } catch (err) {
            console.error(
                "Error resetting task:",
                err
            );

            setError(
                "Failed to reset task. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // DELETE INDIVIDUAL TASK
    // -----------------------------------------
    const deleteTask = async (taskId) => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.delete(
                `${API_URL}/task/${taskId}`
            );

            await fetchTasks();

        } catch (err) {
            console.error(
                "Error deleting task:",
                err
            );

            setError(
                "Failed to delete task. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // DELETE ALL TASKS
    // -----------------------------------------
    const deleteAllTasks = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete all tasks?"
        );

        if (!confirmDelete) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await Promise.all(
                tasks.map(task =>
                    axios.delete(
                        `${API_URL}/task/${task.id}`
                    )
                )
            );

            setTasks([]);

        } catch (err) {
            console.error(
                "Error deleting tasks:",
                err
            );

            setError(
                "Failed to delete tasks. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // START EDITING
    // -----------------------------------------
    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(
            task.description
        );
    };

    // -----------------------------------------
    // SAVE EDIT
    // -----------------------------------------
    const saveEdit = async (task) => {
        if (!editTitle.trim()) {
            setError(
                "Task title cannot be empty"
            );

            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await axios.put(
                `${API_URL}/task/${task.id}`,
                {
                    ...task,
                    title: editTitle,
                    description: editDescription
                }
            );

            setEditingTaskId(null);

            await fetchTasks();

        } catch (err) {
            console.error(
                "Error saving task:",
                err
            );

            setError(
                "Failed to save changes. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------------------
    // CANCEL EDIT
    // -----------------------------------------
    const cancelEdit = () => {
        setEditingTaskId(null);
    };

    // -----------------------------------------
    // FILTER TASKS
    // -----------------------------------------
    const incompleteTasks = useMemo(
        () =>
            tasks.filter(
                task => !task.isCompleted
            ),
        [tasks]
    );

    const completedTasks = useMemo(
        () =>
            tasks.filter(
                task => task.isCompleted
            ),
        [tasks]
    );

    // -----------------------------------------
    // UI
    // -----------------------------------------
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                backgroundColor: "#f9fafb",
                padding: "40px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "black"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1400px",
                    background: "#ffffff",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow:
                        "0 10px 25px rgba(0,0,0,0.1)",
                    color: "black"
                }}
            >
                <h1
                    style={{
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        textAlign: "center"
                    }}
                >
                    🗂️ Task Manager
                </h1>

                <h3
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                        color: "black"
                    }}
                >
                    ⏳ Time remaining to reset tasks:{" "}
                    <strong>
                        {timeRemaining}
                    </strong>
                </h3>

                {error && (
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                            borderRadius: "6px",
                            marginBottom: "20px",
                            textAlign: "center"
                        }}
                    >
                        {error}
                    </div>
                )}

                <div
                    style={{
                        marginBottom: "30px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "center"
                    }}
                >
                    <input
                        value={newTask}
                        onChange={(e) =>
                            setNewTask(
                                e.target.value
                            )
                        }
                        placeholder="Task title"
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border:
                                "1px solid black",
                            width: "180px",
                            color: "black",
                            backgroundColor:
                                "white"
                        }}
                        disabled={isLoading}
                    />

                    <input
                        value={newDescription}
                        onChange={(e) =>
                            setNewDescription(
                                e.target.value
                            )
                        }
                        placeholder="Task description"
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border:
                                "1px solid black",
                            width: "200px",
                            color: "black",
                            backgroundColor:
                                "white"
                        }}
                        disabled={isLoading}
                    />

                    <button
                        onClick={addTask}
                        style={{
                            padding:
                                "10px 16px",
                            borderRadius: "6px",
                            background:
                                "#dbeafe",
                            color: "black",
                            border:
                                "1px solid #93c5fd"
                        }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Adding..."
                            : "Add Task"}
                    </button>

                    <button
                        onClick={resetAllTasks}
                        style={{
                            padding:
                                "10px 16px",
                            borderRadius: "6px",
                            background:
                                "#fef9c3",
                            color: "black",
                            border:
                                "1px solid #fde68a"
                        }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Resetting..."
                            : "Reset All"}
                    </button>

                    <button
                        onClick={deleteAllTasks}
                        style={{
                            padding:
                                "10px 16px",
                            borderRadius: "6px",
                            background:
                                "#fee2e2",
                            color: "black",
                            border:
                                "1px solid #fca5a5"
                        }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Deleting..."
                            : "Delete All"}
                    </button>
                </div>

                {isLoading && !tasks.length ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px"
                        }}
                    >
                        Loading tasks...
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            gap: "40px",
                            flexWrap: "wrap",
                            color: "black"
                        }}
                    >
                        {/* -------------------------------- */}
                        {/* INCOMPLETE TASKS */}
                        {/* -------------------------------- */}

                        <div
                            style={{
                                flex: "1",
                                minWidth: "300px"
                            }}
                        >
                            <h2
                                style={{
                                    fontSize:
                                        "1.5rem",
                                    fontWeight:
                                        "bold",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                🕑 Tasks yet to Complete
                            </h2>

                            {incompleteTasks.length ===
                                0 ? (
                                <div
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "20px",
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    No incomplete tasks
                                </div>
                            ) : (
                                incompleteTasks.map(
                                    task => (
                                        <div
                                            key={
                                                task.id
                                            }
                                            style={{
                                                background:
                                                    "#f3f4f6",
                                                padding:
                                                    "15px",
                                                borderRadius:
                                                    "8px",
                                                marginBottom:
                                                    "15px"
                                            }}
                                        >
                                            {editingTaskId ===
                                                task.id ? (
                                                <>
                                                    <input
                                                        value={
                                                            editTitle
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setEditTitle(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            marginBottom:
                                                                "5px",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    />

                                                    <textarea
                                                        value={
                                                            editDescription
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setEditDescription(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    />

                                                    <button
                                                        onClick={() =>
                                                            saveEdit(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            marginTop:
                                                                "5px",
                                                            marginRight:
                                                                "5px",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        {isLoading
                                                            ? "Saving..."
                                                            : "Save"}
                                                    </button>

                                                    <button
                                                        onClick={
                                                            cancelEdit
                                                        }
                                                        style={{
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "bold",
                                                            fontSize:
                                                                "1.1rem"
                                                        }}
                                                    >
                                                        {
                                                            task.title
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "10px"
                                                        }}
                                                    >
                                                        {
                                                            task.description
                                                        }
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            markAsDone(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#bbf7d0",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #86efac",
                                                            marginRight:
                                                                "5px"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Mark as Done
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#bfdbfe",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #93c5fd",
                                                            marginRight:
                                                                "5px"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteTask(
                                                                task.id
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#fecaca",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #f87171"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )
                                )
                            )}
                        </div>

                        {/* -------------------------------- */}
                        {/* COMPLETED TASKS */}
                        {/* -------------------------------- */}

                        <div
                            style={{
                                flex: "1",
                                minWidth: "300px"
                            }}
                        >
                            <h2
                                style={{
                                    fontSize:
                                        "1.5rem",
                                    fontWeight:
                                        "bold",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                ✅ Completed Tasks
                            </h2>

                            {completedTasks.length ===
                                0 ? (
                                <div
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "20px",
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    No completed tasks
                                </div>
                            ) : (
                                completedTasks.map(
                                    task => (
                                        <div
                                            key={
                                                task.id
                                            }
                                            style={{
                                                background:
                                                    "#e0f2fe",
                                                padding:
                                                    "15px",
                                                borderRadius:
                                                    "8px",
                                                marginBottom:
                                                    "15px"
                                            }}
                                        >
                                            {editingTaskId ===
                                                task.id ? (
                                                <>
                                                    <input
                                                        value={
                                                            editTitle
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setEditTitle(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            marginBottom:
                                                                "5px",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    />

                                                    <textarea
                                                        value={
                                                            editDescription
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setEditDescription(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    />

                                                    <button
                                                        onClick={() =>
                                                            saveEdit(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            marginTop:
                                                                "5px",
                                                            marginRight:
                                                                "5px",
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        {isLoading
                                                            ? "Saving..."
                                                            : "Save"}
                                                    </button>

                                                    <button
                                                        onClick={
                                                            cancelEdit
                                                        }
                                                        style={{
                                                            color:
                                                                "black"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "bold",
                                                            fontSize:
                                                                "1.1rem"
                                                        }}
                                                    >
                                                        {
                                                            task.title
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "10px"
                                                        }}
                                                    >
                                                        {
                                                            task.description
                                                        }
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            resetTask(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#fef08a",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #facc15",
                                                            marginRight:
                                                                "5px"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Reset
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                task
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#bfdbfe",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #93c5fd",
                                                            marginRight:
                                                                "5px"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteTask(
                                                                task.id
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#fecaca",
                                                            color:
                                                                "black",
                                                            border:
                                                                "1px solid #f87171"
                                                        }}
                                                        disabled={
                                                            isLoading
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskList;