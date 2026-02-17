
import os
import stat

def fix_line_endings_and_symlinks(directory):
    for root, dirs, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            
            # Fix line endings for shell scripts
            if filename.endswith('.sh'):
                with open(filepath, 'rb') as f:
                    content = f.read()
                
                new_content = content.replace(b'\r\n', b'\n')
                
                if new_content != content:
                    with open(filepath, 'wb') as f:
                        f.write(new_content)
                    print(f"Fixed line endings: {filepath}")
                
                # Make executable
                st = os.stat(filepath)
                os.chmod(filepath, st.st_mode | stat.S_IEXEC)

    # Specific fix for symlinks in docker-entrypoint.d
    entrypoint_d = os.path.join(directory, 'docker-entrypoint.d')
    if os.path.exists(entrypoint_d):
        for root, dirs, files in os.walk(entrypoint_d):
            for filename in files:
                filepath = os.path.join(root, filename)
                # Check if file is small (likely a text file masquerading as a symlink)
                if os.path.getsize(filepath) < 1024:
                    with open(filepath, 'rb') as f:
                        content = f.read().strip()
                    
                    # If content looks like a relative path to a shell script
                    if content.startswith(b'../') and content.endswith(b'.sh'):
                        target = content.decode('utf-8')
                        print(f"Found fake symlink: {filepath} -> {target}")
                        os.remove(filepath)
                        os.symlink(target, filepath)
                        print(f"Replaced with real symlink: {filepath} -> {target}")

if __name__ == "__main__":
    fix_line_endings_and_symlinks('/label-studio/deploy')
