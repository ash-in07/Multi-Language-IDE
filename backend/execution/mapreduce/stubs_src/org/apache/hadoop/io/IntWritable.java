package org.apache.hadoop.io;
import java.io.*;
public class IntWritable implements WritableComparable<IntWritable> {
    private int val = 0;
    public IntWritable() {}
    public IntWritable(int val) { this.val = val; }
    public void set(int val) { this.val = val; }
    public int get() { return val; }
    public String toString() { return String.valueOf(val); }
    public int compareTo(IntWritable o) { return Integer.compare(this.val, o.val); }
    public boolean equals(Object o) { return (o instanceof IntWritable) && ((IntWritable)o).val == this.val; }
    public int hashCode() { return Integer.hashCode(val); }
    public void write(DataOutput out) throws IOException { out.writeInt(val); }
    public void readFields(DataInput in) throws IOException { val = in.readInt(); }
}
