// View layer: formats the response payload for API clients.
// Views keep response shape consistent and separate formatting from business logic.
function taskResponse(task) {
  return { data: task };
}

// Format list responses with pagination metadata
function taskListResponse(tasks, pagination) {
  return {
    data: tasks,
    pagination,
  };
}

module.exports = {
  taskResponse,
  taskListResponse,
};
