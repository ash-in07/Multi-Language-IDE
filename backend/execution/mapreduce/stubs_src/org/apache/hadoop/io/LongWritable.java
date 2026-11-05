package org.apache.hadoop.io;
import java.io.*;
public class LongWritable implements WritableComparable<LongWritable> {
    private long val = 0L;
    public LongWritable() {}
    public LongWritable(long val) { this.val = val; }
    public void set(long val) { this.val = val; }
    public long get() { return val; }
    public String toString() { return String.valueOf(val); }
    public int compareTo(LongWritable o) { return Long.compare(this.val, o.val); }
    public boolean equals(Object o) { return (o instanceof LongWritable) && ((LongWritable)o).val == this.val; }
    public int hashCode() { return Long.hashCode(val); }
    public void write(DataOutput out) throws IOException { out.writeLong(val); }
    public void readFields(DataInput in) throws IOException { val = in.readLong(); }
}
