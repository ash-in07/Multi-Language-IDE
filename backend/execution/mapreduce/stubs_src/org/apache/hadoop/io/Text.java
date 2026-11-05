package org.apache.hadoop.io;
import java.io.*;
public class Text implements WritableComparable<Text> {
    private String text = "";
    public Text() {}
    public Text(String text) { this.text = text != null ? text : ""; }
    public void set(String text) { this.text = text != null ? text : ""; }
    public String toString() { return text; }
    public int getLength() { return text.length(); }
    public int compareTo(Text o) { return this.text.compareTo(o.text); }
    public boolean equals(Object o) {
        if (o instanceof Text) return text.equals(((Text)o).text);
        return false;
    }
    public int hashCode() { return text.hashCode(); }
    public void write(DataOutput out) throws IOException { out.writeUTF(text); }
    public void readFields(DataInput in) throws IOException { text = in.readUTF(); }
}
