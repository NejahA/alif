use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize)]
pub struct SystemStats {
    os_name: String,
    arch: String,
    timestamp: u64,
    app_version: String,
    status: String,
    total_projects: usize,
}

#[tauri::command]
fn greet(name: &str) -> String {
    if name.trim().is_empty() {
        "Welcome to Alif Master Desktop!".to_string()
    } else {
        format!("Salam, {}! Welcome to Alif Master Desktop.", name)
    }
}

#[tauri::command]
fn get_system_stats() -> SystemStats {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    SystemStats {
        os_name: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        timestamp: now,
        app_version: "1.0.0".to_string(),
        status: "Healthy".to_string(),
        total_projects: 294,
    }
}

#[tauri::command]
fn open_in_explorer(folder_path: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(folder_path)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Opened {}", folder_path))
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Opening {}", folder_path))
    }
}

#[tauri::command]
fn open_in_vscode(folder_path: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "code", folder_path])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Opened in VS Code: {}", folder_path))
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Opened in VS Code: {}", folder_path))
    }
}

#[tauri::command]
fn run_project_terminal(folder_path: &str, command: Option<&str>) -> Result<String, String> {
    let cmd_to_run = match command {
        Some(c) if !c.trim().is_empty() => c,
        _ => "npm start",
    };

    #[cfg(target_os = "windows")]
    {
        // Spawns a dedicated PowerShell window in the project folder running the command
        let ps_arg = format!("cd '{}'; Write-Host '🚀 Running [{}] in {}' -ForegroundColor Cyan; {}; pause", folder_path, cmd_to_run, folder_path, cmd_to_run);
        Command::new("cmd")
            .args(&["/C", "start", "powershell", "-NoExit", "-Command", &ps_arg])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Launched terminal for: {}", cmd_to_run))
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Launching: {}", cmd_to_run))
    }
}

#[tauri::command]
fn open_in_browser(url: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", url])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Opened {}", url))
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Opened {}", url))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_system_stats, 
            open_in_explorer, 
            open_in_vscode,
            run_project_terminal,
            open_in_browser
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
