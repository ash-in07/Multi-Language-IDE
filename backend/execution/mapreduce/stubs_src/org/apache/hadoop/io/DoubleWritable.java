package org.apache.hadoop.io;
import java.io.*;
public class DoubleWritable implements WritableComparable<DoubleWritable> {
    private double val = 0.0;
    public DoubleWritable() {}
    public DoubleWritable(double val) { this.val = val; }
    public void set(double val) { this.val = val; }
    public double get() { return val; }
    public String toString() { return String.valueOf(val); }
    public int compareTo(DoubleWritable o) { return Double.compare(this.val, o.val); }
    public boolean equals(Object o) { return (o instanceof DoubleWritable) && Double.compare(((DoubleWritable)o).val, this.val) == 0; }
    public int hashCode() { return Double.hashCode(val); }
    public void write(DataOutput out) throws IOException { out.writeDouble(val); }
    public void readFields(DataInput in) throws IOException { val = in.readDouble(); }
}
