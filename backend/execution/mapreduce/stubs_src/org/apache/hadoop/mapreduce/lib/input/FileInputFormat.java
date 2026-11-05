package org.apache.hadoop.mapreduce.lib.input;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.fs.Path;
public class FileInputFormat {
    public static void addInputPath(Job job, Path path) {
        job.setInputPath(path.toString());
    }
}
