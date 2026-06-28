package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Allows our frontend React app to connect safely without CORS blocks
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    // 1. Get all tasks from the database
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // 2. Create a new task and save it to the database
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }
    // 3. Update task status safely with concurrency handling
    @PutMapping("/{id}/status")
    @org.springframework.transaction.annotation.Transactional
    public Task updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        task.setStatus(status);
        
        // If another thread modified this task since we fetched it, 
        // this save call will throw an ObjectOptimisticLockingFailureException, preventing data corruption!
        return taskRepository.save(task);
    }
}