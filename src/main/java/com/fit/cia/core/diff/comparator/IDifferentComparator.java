package com.fit.cia.core.diff.comparator;

import com.fit.cia.core.treemodel.Node;

/**
 * Created by locdt on 7/16/2017.
 */
public interface IDifferentComparator {
	boolean isDifferent(Node base, Node changed);
}