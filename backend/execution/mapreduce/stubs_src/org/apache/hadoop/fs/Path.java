package org.apache.hadoop.fs;
public class Path {
    private String path;
    public Path(String path) { this.path = path; }
    public String toString() { return path; }
    public String getName() {
        int idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        return idx >= 0 ? path.substring(idx + 1) : path;
    }
}
