import os
import zipfile

def zip_project(source_dir, output_filename):
    print(f"Starting backup of {source_dir}...")
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude directories
            # Modify dirs in-place to skip traversing them
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.git', '.vscode', '.idea', '__pycache__', 'coverage']]
            
            for file in files:
                # Avoid zipping the backup itself or other large archives
                if file == os.path.basename(output_filename) or file.endswith('.zip') or file.endswith('.tar.gz'):
                    continue
                    
                file_path = os.path.join(root, file)
                # Create relative path for archive (including the root folder name)
                # os.path.relpath(file_path, os.path.dirname(source_dir)) will create "travelmap_workspace/frontend/..."
                arcname = os.path.relpath(file_path, os.path.dirname(source_dir))
                
                try:
                    zipf.write(file_path, arcname)
                except Exception as e:
                    print(f"Skipping {file_path}: {e}")
                    
    print(f"Backup successfully created at: {output_filename}")

if __name__ == '__main__':
    source = r'C:\Users\10124\Downloads\travelmap_workspace'
    destination = r'C:\Users\10124\Downloads\travelmap_project_backup.zip'
    zip_project(source, destination)
